package com.rey.motoboy;

import android.content.ContentValues;
import android.content.Context;
import android.content.Intent;
import android.net.Uri;
import android.os.Build;
import android.os.Environment;
import android.print.PrintAttributes;
import android.print.PrintDocumentAdapter;
import android.print.PrintManager;
import android.provider.MediaStore;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import androidx.core.content.FileProvider;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import java.io.File;
import java.io.FileOutputStream;
import java.io.OutputStream;
import java.nio.charset.StandardCharsets;

/**
 * Lo que la página web sola NO puede hacer dentro de la APK:
 *  · imprimir()  → los reportes PDF. En el navegador se abría una ventana y se llamaba a
 *                  print(); dentro de la APK no hay ventanas ni print(). Aquí el reporte se
 *                  pinta en un WebView invisible y se le pasa al diálogo de impresión de
 *                  Android, que trae "Guardar como PDF".
 *  · guardar()   → el respaldo .json. El navegador lo bajaba con un enlace "download"; la
 *                  APK no tiene barra de descargas. Se guarda en Descargas/Motoboy y, si se
 *                  pide, se abre el menú de compartir (WhatsApp, Drive, correo…).
 */
@CapacitorPlugin(name = "Moto")
public class MotoPlugin extends Plugin {

    // El WebView del reporte tiene que vivir mientras Android lo imprime.
    private WebView webImpresion;

    @PluginMethod
    public void imprimir(PluginCall call) {
        final String html = call.getString("html", "");
        final String titulo = call.getString("titulo", "Reporte Motoboy");
        getActivity().runOnUiThread(() -> {
            try {
                final WebView w = new WebView(getContext());
                webImpresion = w;
                w.setWebViewClient(new WebViewClient() {
                    private boolean hecho = false;
                    @Override
                    public void onPageFinished(WebView view, String url) {
                        if (hecho) return;
                        hecho = true;
                        try {
                            PrintManager pm = (PrintManager) getActivity().getSystemService(Context.PRINT_SERVICE);
                            PrintDocumentAdapter ad = view.createPrintDocumentAdapter(titulo);
                            PrintAttributes attrs = new PrintAttributes.Builder()
                                .setMediaSize(PrintAttributes.MediaSize.ISO_A4)
                                .build();
                            pm.print(titulo, ad, attrs);
                            call.resolve();
                        } catch (Exception e) {
                            call.reject("No se pudo abrir la impresión: " + e.getMessage());
                        }
                    }
                });
                w.loadDataWithBaseURL("https://localhost/", html, "text/html", "UTF-8", null);
            } catch (Exception e) {
                call.reject("No se pudo preparar el reporte: " + e.getMessage());
            }
        });
    }

    @PluginMethod
    public void guardar(PluginCall call) {
        String nombre = call.getString("nombre", "motoboy.json");
        String contenido = call.getString("contenido", "");
        String mime = call.getString("mime", "application/json");
        boolean compartir = Boolean.TRUE.equals(call.getBoolean("compartir", true));
        byte[] datos = contenido.getBytes(StandardCharsets.UTF_8);
        JSObject r = new JSObject();
        try {
            // 1) Copia visible en Descargas/Motoboy (Android 10 en adelante no pide permiso).
            String enDescargas = null;
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                ContentValues v = new ContentValues();
                v.put(MediaStore.Downloads.DISPLAY_NAME, nombre);
                v.put(MediaStore.Downloads.MIME_TYPE, mime);
                v.put(MediaStore.Downloads.RELATIVE_PATH, Environment.DIRECTORY_DOWNLOADS + "/Motoboy");
                Uri uri = getContext().getContentResolver().insert(MediaStore.Downloads.EXTERNAL_CONTENT_URI, v);
                if (uri != null) {
                    try (OutputStream os = getContext().getContentResolver().openOutputStream(uri)) {
                        if (os != null) os.write(datos);
                    }
                    enDescargas = "Descargas/Motoboy/" + nombre;
                }
            }
            r.put("descargas", enDescargas);

            // 2) Copia en la caché para poder compartirla.
            File dir = new File(getContext().getCacheDir(), "compartir");
            dir.mkdirs();
            File f = new File(dir, nombre);
            try (FileOutputStream fo = new FileOutputStream(f)) {
                fo.write(datos);
            }
            if (compartir || enDescargas == null) {
                Uri u = FileProvider.getUriForFile(getContext(), getContext().getPackageName() + ".fileprovider", f);
                Intent i = new Intent(Intent.ACTION_SEND);
                i.setType(mime);
                i.putExtra(Intent.EXTRA_STREAM, u);
                i.putExtra(Intent.EXTRA_SUBJECT, nombre);
                i.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);
                Intent ch = Intent.createChooser(i, "Guardar o enviar el respaldo");
                ch.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                getContext().startActivity(ch);
                r.put("compartido", true);
            }
            call.resolve(r);
        } catch (Exception e) {
            call.reject("No se pudo guardar: " + e.getMessage());
        }
    }
}
