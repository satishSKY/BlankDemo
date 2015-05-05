package com.info.demo;


import org.apache.cordova.CordovaActivity;

import android.os.Bundle;

public class InfoDemoActivity extends CordovaActivity {
    /** Called when the activity is first created. */
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        //super.loadUrl("file:///android_asset/www/index.html");
        // Set by <content src="index.html" /> in config.xml
        loadUrl(launchUrl);
    }
}
