package com.example.samsunghistoryviewer

import android.content.Context
import android.net.Uri
import java.text.SimpleDateFormat
import java.util.*

object BrowserHistoryReader {
    fun getHistory(context: Context): List<HistoryItem> {
        val historyList = mutableListOf<HistoryItem>()
        val uri = Uri.parse("content://com.sec.android.app.sbrowser.browser/history")
        
        try {
            context.contentResolver.query(
                uri,
                null,
                null,
                null,
                "date DESC"
            )?.use { cursor ->
                while (cursor.moveToNext()) {
                    val titleIndex = cursor.getColumnIndex("title")
                    val urlIndex = cursor.getColumnIndex("url")
                    val dateIndex = cursor.getColumnIndex("date")

                    if (titleIndex >= 0 && urlIndex >= 0 && dateIndex >= 0) {
                        val title = cursor.getString(titleIndex)
                        val url = cursor.getString(urlIndex)
                        val date = cursor.getLong(dateIndex)
                        
                        val dateFormat = SimpleDateFormat("yyyy-MM-dd HH:mm", Locale.getDefault())
                        val formattedDate = dateFormat.format(Date(date))

                        historyList.add(HistoryItem(title, url, formattedDate))
                    }
                }
            }
        } catch (e: Exception) {
            e.printStackTrace()
        }

        return historyList
    }
} 