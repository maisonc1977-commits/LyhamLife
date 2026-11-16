package com.lyham.vie;

import android.Manifest;
import android.app.Activity;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.os.Bundle;
import android.speech.RecognitionListener;
import android.speech.RecognizerIntent;
import android.speech.SpeechRecognizer;
import android.speech.tts.TextToSpeech;
import android.webkit.JavascriptInterface;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import org.json.JSONArray;
import java.util.ArrayList;
import java.util.Locale;

public class MainActivity extends Activity {
    private static final int DEMANDE_MICRO = 42;
    private WebView web;
    private TextToSpeech tts;
    private boolean ttsOk = false;
    private SpeechRecognizer reco;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        web = new WebView(this);
        WebSettings s = web.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);
        s.setAllowFileAccess(true);
        s.setMediaPlaybackRequiresUserGesture(false);
        web.setWebViewClient(new WebViewClient());
        web.addJavascriptInterface(new Pont(), "AndroidVoix");

        // Voix anglaise (britannique) pour les exercices de prononciation
        tts = new TextToSpeech(this, status -> {
            if (status == TextToSpeech.SUCCESS) {
                int r = tts.setLanguage(Locale.UK);
                ttsOk = r != TextToSpeech.LANG_MISSING_DATA && r != TextToSpeech.LANG_NOT_SUPPORTED;
            }
        });

        web.loadUrl("file:///android_asset/index.html");
        setContentView(web);
    }

    /** Fonctions appelables depuis le jeu : AndroidVoix.parler("hello", 0.8) ... */
    private class Pont {
        @JavascriptInterface
        public boolean voixDispo() { return ttsOk; }

        @JavascriptInterface
        public boolean ecouteDispo() { return SpeechRecognizer.isRecognitionAvailable(MainActivity.this); }

        @JavascriptInterface
        public void parler(String texte, float vitesse) {
            if (!ttsOk) return;
            tts.setSpeechRate(vitesse);
            tts.speak(texte, TextToSpeech.QUEUE_FLUSH, null, "lyham");
        }

        @JavascriptInterface
        public void ecouter() { runOnUiThread(MainActivity.this::demarrerEcoute); }

        @JavascriptInterface
        public void arreterEcoute() { runOnUiThread(() -> { if (reco != null) reco.cancel(); }); }
    }

    private void demarrerEcoute() {
        if (checkSelfPermission(Manifest.permission.RECORD_AUDIO) != PackageManager.PERMISSION_GRANTED) {
            requestPermissions(new String[]{Manifest.permission.RECORD_AUDIO}, DEMANDE_MICRO);
            return;
        }
        if (!SpeechRecognizer.isRecognitionAvailable(this)) {
            js("window.onEcouteErreur&&onEcouteErreur(-1)");
            return;
        }
        if (reco == null) {
            reco = SpeechRecognizer.createSpeechRecognizer(this);
            reco.setRecognitionListener(new RecognitionListener() {
                @Override public void onReadyForSpeech(Bundle b) { js("window.onEcoutePrete&&onEcoutePrete()"); }
                @Override public void onBeginningOfSpeech() { }
                @Override public void onRmsChanged(float v) { }
                @Override public void onBufferReceived(byte[] b) { }
                @Override public void onEndOfSpeech() { }
                @Override public void onError(int code) { js("window.onEcouteErreur&&onEcouteErreur(" + code + ")"); }
                @Override public void onPartialResults(Bundle b) { }
                @Override public void onEvent(int type, Bundle b) { }
                @Override public void onResults(Bundle r) {
                    ArrayList<String> liste = r.getStringArrayList(SpeechRecognizer.RESULTS_RECOGNITION);
                    JSONArray a = new JSONArray();
                    if (liste != null) for (String x : liste) a.put(x);
                    js("window.onEcouteResultat&&onEcouteResultat(" + a.toString() + ")");
                }
            });
        }
        Intent i = new Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH);
        i.putExtra(RecognizerIntent.EXTRA_LANGUAGE_MODEL, RecognizerIntent.LANGUAGE_MODEL_FREE_FORM);
        i.putExtra(RecognizerIntent.EXTRA_LANGUAGE, "en-GB");
        i.putExtra(RecognizerIntent.EXTRA_MAX_RESULTS, 5);
        reco.startListening(i);
    }

    @Override
    public void onRequestPermissionsResult(int code, String[] perms, int[] res) {
        super.onRequestPermissionsResult(code, perms, res);
        if (code != DEMANDE_MICRO) return;
        if (res.length > 0 && res[0] == PackageManager.PERMISSION_GRANTED) demarrerEcoute();
        else js("window.onEcouteErreur&&onEcouteErreur(" + SpeechRecognizer.ERROR_INSUFFICIENT_PERMISSIONS + ")");
    }

    private void js(String code) {
        runOnUiThread(() -> web.evaluateJavascript(code, null));
    }

    @Override
    protected void onPause() {
        super.onPause();
        // Coupe la musique et les sons quand l'application passe en arrière-plan
        js("window.onPauseJeu&&onPauseJeu()");
    }

    @Override
    protected void onResume() {
        super.onResume();
        if (web != null) js("window.onRepriseJeu&&onRepriseJeu()");
    }

    @Override
    protected void onDestroy() {
        if (tts != null) tts.shutdown();
        if (reco != null) reco.destroy();
        super.onDestroy();
    }

    @Override
    public void onBackPressed() {
        // Ferme la fenêtre ouverte dans le jeu ; sinon quitte l'application
        web.evaluateJavascript(
            "(function(){var m=document.getElementById('modal');if(m&&m.classList.contains('on')){m.classList.remove('on');return 1}return 0})()",
            r -> { if (!"1".equals(r)) MainActivity.super.onBackPressed(); });
    }
}
