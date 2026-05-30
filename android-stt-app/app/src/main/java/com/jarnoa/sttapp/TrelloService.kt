package com.jarnoa.sttapp

import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import java.net.HttpURLConnection
import java.net.URL
import java.net.URLEncoder

object TrelloService {

    suspend fun createCard(key: String, token: String, listId: String, text: String): Boolean =
        withContext(Dispatchers.IO) {
            try {
                val encodedName = URLEncoder.encode(text.take(512), "UTF-8")
                val url = URL(
                    "https://api.trello.com/1/cards" +
                    "?key=$key&token=$token&idList=$listId&name=$encodedName"
                )
                val conn = url.openConnection() as HttpURLConnection
                conn.requestMethod = "POST"
                conn.connectTimeout = 10_000
                conn.readTimeout = 10_000
                val code = conn.responseCode
                conn.disconnect()
                code in 200..299
            } catch (e: Exception) {
                false
            }
        }
}
