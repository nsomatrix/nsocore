package mod.net;

import dq;
import main.a;
import mod.log.MatrixLogger;

public class MatrixNet {

    /**
     * Programmatically requests full player info for any target player by name string via Packet 93.
     */
    public static void inspectPlayer(String playerName) {
        if (playerName != null && playerName.length() > 0) {
            MatrixLogger.resetLoggedPlayer(); // Reset cache to allow fresh print for new target
            MatrixLogger.log("API", "Sending programmatic Inspect Request for: \"" + playerName + "\"");
            // Sends Packet 93 to server with target player name string
            dq.a().a(playerName, 0);
        } else {
            a.a("Invalid Player Name!");
        }
    }
}
