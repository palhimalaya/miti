package expo.modules.mititodaybar

import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.graphics.Bitmap
import android.graphics.Canvas
import android.graphics.Color
import android.graphics.Paint
import android.graphics.RectF
import android.graphics.Typeface
import android.os.Build
import androidx.core.app.NotificationCompat
import androidx.core.graphics.drawable.IconCompat
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class MitiTodayBarModule : Module() {
  companion object {
    private const val CHANNEL_ID = "miti-today"
    private const val NOTIFICATION_ID = 2083
  }

  override fun definition() = ModuleDefinition {
    Name("MitiTodayBar")

    AsyncFunction("show") { day: Int, title: String, body: String ->
      val context = appContext.reactContext
      if (context == null) {
        return@AsyncFunction null
      }
      ensureChannel(context)

      val launchIntent = context.packageManager.getLaunchIntentForPackage(context.packageName)
        ?: Intent()
      launchIntent.addFlags(Intent.FLAG_ACTIVITY_SINGLE_TOP)
      val contentIntent = PendingIntent.getActivity(
        context,
        0,
        launchIntent,
        PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE,
      )

      val iconBitmap = createDayIconBitmap(day.coerceIn(1, 32))
      val builder = NotificationCompat.Builder(context, CHANNEL_ID)
        .setSmallIcon(IconCompat.createWithBitmap(iconBitmap))
        .setContentTitle(title)
        .setContentText(body)
        .setStyle(NotificationCompat.BigTextStyle().bigText(body))
        .setOngoing(true)
        .setOnlyAlertOnce(true)
        .setSilent(true)
        .setPriority(NotificationCompat.PRIORITY_LOW)
        .setCategory(NotificationCompat.CATEGORY_STATUS)
        .setContentIntent(contentIntent)
        .setColor(0xFF9B1C31.toInt())

      val manager = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
      manager.notify(NOTIFICATION_ID, builder.build())
      null
    }

    AsyncFunction("hide") {
      val context = appContext.reactContext
      if (context == null) {
        return@AsyncFunction null
      }
      val manager = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
      manager.cancel(NOTIFICATION_ID)
      null
    }
  }

  private fun ensureChannel(context: Context) {
    if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) return
    val manager = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
    val existing = manager.getNotificationChannel(CHANNEL_ID)
    if (existing != null) return
    val channel = NotificationChannel(
      CHANNEL_ID,
      "Nepali today",
      NotificationManager.IMPORTANCE_LOW,
    ).apply {
      setShowBadge(false)
      enableVibration(false)
      description = "Persistent Nepali date in the notification shade"
    }
    manager.createNotificationChannel(channel)
  }

  private fun createDayIconBitmap(day: Int): Bitmap {
    val size = 96
    val bitmap = Bitmap.createBitmap(size, size, Bitmap.Config.ARGB_8888)
    val canvas = Canvas(bitmap)

    val stroke = Paint(Paint.ANTI_ALIAS_FLAG).apply {
      color = Color.WHITE
      style = Paint.Style.STROKE
      strokeWidth = 5f
    }
    val inset = 8f
    canvas.drawRoundRect(RectF(inset, inset, size - inset, size - inset), 14f, 14f, stroke)

    val text = toDevanagari(day)
    val textPaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
      color = Color.WHITE
      textAlign = Paint.Align.CENTER
      typeface = Typeface.create(Typeface.SANS_SERIF, Typeface.BOLD)
      textSize = if (text.length > 1) 42f else 52f
    }
    val x = size / 2f
    val y = size / 2f - (textPaint.descent() + textPaint.ascent()) / 2f
    canvas.drawText(text, x, y, textPaint)
    return bitmap
  }

  private fun toDevanagari(value: Int): String {
    val digits = charArrayOf('०', '१', '२', '३', '४', '५', '६', '७', '८', '९')
    return value.toString().map { ch ->
      if (ch.isDigit()) digits[ch - '0'] else ch
    }.joinToString("")
  }
}
