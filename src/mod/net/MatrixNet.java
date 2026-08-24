package mod.net;

import dq;
import main.a;
import mod.log.MatrixLogger;

public class MatrixNet {

    public static boolean isWebTriggeredInspect = false;
    public static String lastRequestedTarget = null;
    public static long lastRequestedTime = 0;

    /**
     * Programmatically requests full player info for any target player by name string via Packet 93.
     */
    public static void inspectPlayer(String playerName) {
        inspectPlayer(playerName, false);
    }

    public static void inspectPlayer(final String playerName, final boolean fromWeb) {
        if (playerName != null && playerName.length() > 0) {
            final String cleanTarget = playerName.trim();
            isWebTriggeredInspect = fromWeb;
            lastRequestedTarget = cleanTarget;
            lastRequestedTime = System.currentTimeMillis();
            MatrixLogger.resetLoggedPlayer(); // Reset cache to allow fresh print for new target
            MatrixLogger.log("API", "Sending programmatic Inspect Request (fromWeb=" + fromWeb + ") for: \"" + cleanTarget + "\"");
            
            // Primary Dispatch (Pulse #1 - Warms up cold server cache)
            dq.a().a(cleanTarget, 0);

            // Automatic Dual-Pulse Retry (Pulse #2 at +750ms if cold server cache delayed first response)
            new Thread(new Runnable() {
                public void run() {
                    try {
                        Thread.sleep(750);
                        if (cleanTarget.equalsIgnoreCase(lastRequestedTarget) 
                            && !cleanTarget.equalsIgnoreCase(MatrixLogger.getLastLoggedPlayer())) {
                            MatrixLogger.log("API", "Executing Warm-Up Dual-Pulse for target: \"" + cleanTarget + "\"");
                            dq.a().a(cleanTarget, 0);
                        }
                    } catch (Exception e) {}
                }
            }).start();
        } else {
            a.a("Invalid Player Name!");
        }
    }
}
