package com.jarnoa.sttapp

import android.os.Bundle
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import com.jarnoa.sttapp.databinding.ActivitySettingsBinding

class SettingsActivity : AppCompatActivity() {

    private lateinit var binding: ActivitySettingsBinding

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivitySettingsBinding.inflate(layoutInflater)
        setContentView(binding.root)

        setSupportActionBar(binding.toolbar)
        supportActionBar?.setDisplayHomeAsUpEnabled(true)
        supportActionBar?.title = "Asetukset"

        loadSettings()
        binding.btnSave.setOnClickListener { saveSettings() }
    }

    private fun loadSettings() {
        val prefs = getSharedPreferences("stt_settings", MODE_PRIVATE)
        binding.etTrelloKey.setText(prefs.getString("trello_key", ""))
        binding.etTrelloToken.setText(prefs.getString("trello_token", ""))
        binding.etTrelloListId.setText(prefs.getString("trello_list_id", ""))
        binding.etEmailRecipient.setText(prefs.getString("email_recipient", ""))
    }

    private fun saveSettings() {
        getSharedPreferences("stt_settings", MODE_PRIVATE).edit().apply {
            putString("trello_key", binding.etTrelloKey.text.toString().trim())
            putString("trello_token", binding.etTrelloToken.text.toString().trim())
            putString("trello_list_id", binding.etTrelloListId.text.toString().trim())
            putString("email_recipient", binding.etEmailRecipient.text.toString().trim())
            apply()
        }
        Toast.makeText(this, "Asetukset tallennettu", Toast.LENGTH_SHORT).show()
        finish()
    }

    override fun onSupportNavigateUp(): Boolean {
        finish()
        return true
    }
}
