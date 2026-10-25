package com.rey.motoboy;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        // El plugin propio se registra ANTES de arrancar el puente.
        registerPlugin(MotoPlugin.class);
        super.onCreate(savedInstanceState);
    }
}
