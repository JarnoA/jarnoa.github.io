package com.jarnoa.sttapp

import android.Manifest
import android.content.Intent
import android.content.pm.PackageManager
import android.content.res.ColorStateList
import android.net.Uri
import android.os.Bundle
import android.speech.RecognitionListener
import android.speech.RecognizerIntent
import android.speech.SpeechRecognizer
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat
import androidx.lifecycle.lifecycleScope
import com.jarnoa.sttapp.databinding.ActivityMainBinding
import kotlinx.coroutines.launch

class MainActivity : AppCompatActivity() {

    private lateinit var binding: ActivityMainBinding
    private lateinit var speechRecognizer: SpeechRecognizer
    private var isListening = false
    private var transcribedText = ""

    companion object {
        private const val TRELLO_EMAIL = "jarno8+ljq8wcyvqcqfwikhb2nn@app.trello.com"
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityMainBinding.inflate(layoutInflater)
        setContentView(binding.root)
        checkMicPermission()
        setupSpeechRecognizer()
        setupButtons()
        updateActionButtons(false)
    }

    private fun setupSpeechRecognizer() {
        if (!SpeechRecognizer.isRecognitionAvailable(this)) {
            binding.tvStatus.text = "Puheentunnistus ei ole saatavilla tällä laitteella"
            binding.btnRecord.isEnabled = false
            return
        }
        speechRecognizer = SpeechRecognizer.createSpeechRecognizer(this)
        speechRecognizer.setRecognitionListener(object : RecognitionListener {
            override fun onReadyForSpeech(params: Bundle?) = setRecordingState(true)
            override fun onBeginningOfSpeech() {}
            override fun onRmsChanged(rmsdB: Float) {}
            override fun onBufferReceived(buffer: ByteArray?) {}
            override fun onEndOfSpeech() {
                binding.tvStatus.text = "Käsitellään..."
            }
            override fun onError(error: Int) {
                setRecordingState(false)
                if (error != SpeechRecognizer.ERROR_NO_MATCH &&
                    error != SpeechRecognizer.ERROR_SPEECH_TIMEOUT) {
                    toast("Tunnistusvirhe ($error) — yritä uudelleen")
                }
            }
            override fun onResults(results: Bundle?) {
                setRecordingState(false)
                val matches = results?.getStringArrayList(SpeechRecognizer.RESULTS_RECOGNITION)
                if (!matches.isNullOrEmpty()) {
                    transcribedText = if (transcribedText.isEmpty()) matches[0]
                                      else "$transcribedText ${matches[0]}"
                    binding.etTranscription.setText(transcribedText)
                    updateActionButtons(true)
                }
            }
            override fun onPartialResults(partialResults: Bundle?) {
                val partial = partialResults?.getStringArrayList(SpeechRecognizer.RESULTS_RECOGNITION)
                if (!partial.isNullOrEmpty()) {
                    binding.tvStatus.text = "\"${partial[0]}\""
                }
            }
            override fun onEvent(eventType: Int, params: Bundle?) {}
        })
    }

    private fun setupButtons() {
        binding.btnRecord.setOnClickListener {
            if (isListening) speechRecognizer.stopListening() else startListening()
        }
        binding.btnSendTrello.setOnClickListener {
            val text = binding.etTranscription.text.toString().trim()
            if (text.isNotBlank()) sendToTrello(text)
        }
        binding.btnClear.setOnClickListener {
            transcribedText = ""
            binding.etTranscription.setText("")
            updateActionButtons(false)
            binding.tvStatus.text = "Napauta mikrofonia puhuaksesi"
        }
        binding.btnSettings.setOnClickListener {
            startActivity(Intent(this, SettingsActivity::class.java))
        }
    }

    private fun startListening() {
        val intent = Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH).apply {
            putExtra(RecognizerIntent.EXTRA_LANGUAGE_MODEL, RecognizerIntent.LANGUAGE_MODEL_FREE_FORM)
            putExtra(RecognizerIntent.EXTRA_LANGUAGE, "fi-FI")
            putExtra(RecognizerIntent.EXTRA_PARTIAL_RESULTS, true)
            putExtra(RecognizerIntent.EXTRA_MAX_RESULTS, 1)
        }
        speechRecognizer.startListening(intent)
    }

    private fun setRecordingState(recording: Boolean) {
        isListening = recording
        if (recording) {
            binding.tvStatus.text = "Kuuntelen... (napauta uudelleen lopettaaksesi)"
            binding.btnRecord.backgroundTintList =
                ColorStateList.valueOf(ContextCompat.getColor(this, R.color.recording))
        } else {
            binding.tvStatus.text = "Napauta mikrofonia puhuaksesi"
            binding.btnRecord.backgroundTintList =
                ColorStateList.valueOf(ContextCompat.getColor(this, R.color.primary))
        }
    }

    private fun updateActionButtons(enabled: Boolean) {
        binding.btnSendTrello.isEnabled = enabled
        binding.btnClear.isEnabled = enabled
    }

    private fun sendToTrello(text: String) {
        val prefs = getSharedPreferences("stt_settings", MODE_PRIVATE)
        val key = prefs.getString("trello_key", "").orEmpty()
        val token = prefs.getString("trello_token", "").orEmpty()
        val listId = prefs.getString("trello_list_id", "").orEmpty()

        if (key.isBlank() || token.isBlank() || listId.isBlank()) {
            // No API credentials — send via the Trello email address instead
            val intent = Intent(Intent.ACTION_SENDTO).apply {
                data = Uri.parse("mailto:")
                putExtra(Intent.EXTRA_EMAIL, arrayOf(TRELLO_EMAIL))
                putExtra(Intent.EXTRA_SUBJECT, text.take(100))
                putExtra(Intent.EXTRA_TEXT, text)
            }
            startActivity(intent)
            return
        }

        binding.btnSendTrello.isEnabled = false
        binding.btnSendTrello.text = "Lähetetään..."

        lifecycleScope.launch {
            val ok = TrelloService.createCard(key, token, listId, text)
            binding.btnSendTrello.text = getString(R.string.btn_trello)
            if (ok) {
                toast("Kortti lisätty Trelloon!")
                clearAll()
            } else {
                toast("Trello-virhe — tarkista asetukset")
                binding.btnSendTrello.isEnabled = true
            }
        }
    }

    private fun clearAll() {
        transcribedText = ""
        binding.etTranscription.setText("")
        updateActionButtons(false)
        binding.tvStatus.text = "Napauta mikrofonia puhuaksesi"
    }

    private fun checkMicPermission() {
        if (ContextCompat.checkSelfPermission(this, Manifest.permission.RECORD_AUDIO)
            != PackageManager.PERMISSION_GRANTED) {
            ActivityCompat.requestPermissions(this, arrayOf(Manifest.permission.RECORD_AUDIO), 1)
        }
    }

    override fun onRequestPermissionsResult(
        requestCode: Int, permissions: Array<out String>, grantResults: IntArray
    ) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults)
        if (requestCode == 1 &&
            (grantResults.isEmpty() || grantResults[0] != PackageManager.PERMISSION_GRANTED)) {
            toast("Mikrofonilupa vaaditaan sovelluksen käyttöön")
            binding.btnRecord.isEnabled = false
        }
    }

    private fun toast(msg: String) = Toast.makeText(this, msg, Toast.LENGTH_SHORT).show()

    override fun onDestroy() {
        super.onDestroy()
        if (::speechRecognizer.isInitialized) speechRecognizer.destroy()
    }
}
