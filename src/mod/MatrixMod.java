package mod;

import main.a;
import bd;
import aa;
import dq;

public class MatrixMod {

    /**
     * Appends MatrixAPI as the VERY FIRST option (index 0) in the main game menu.
     */
    public static void addMatrixMenuItem(aa vector) {
        bd matrixBtn = new bd("MatrixAPI", 888999);
        vector.insertElementAt(matrixBtn, 0); // Position 0: Very first option!
    }

    /**
     * Handles MatrixAPI command triggers.
     */
    public static boolean handleMatrixCommand(int commandId, Object obj) {
        if (commandId == 888999) {
            showMatrixMenu();
            return true;
        } else if (commandId == 888901) { // Sub-option: Inspect Player Target
            promptPlayerName();
            return true;
        } else if (commandId == 888903) { // Triggered when OK button is pressed on input box
            submitPlayerInspect();
            return true;
        }
        return false;
    }

    /**
     * Displays MatrixAPI sub-menu list (cleanly expandable for future features).
     */
    public static void showMatrixMenu() {
        aa menuList = new aa();
        menuList.addElement(new bd("Inspect Player Target", 888901));
        a.F.a(menuList); // Native interactive sub-menu list
    }

    /**
     * Opens the exact working in-game text field box screen (main.a.L).
     */
    public static void promptPlayerName() {
        // Construct OK command BD pointing to command 888903
        bd okCmd = new bd("OK", 888903);

        // Open in-game text input screen (a.L)
        a.L.a("Enter Player Name:", okCmd, 0);
    }

    /**
     * Reads typed player name from input screen and dispatches Packet 93 request.
     */
    public static void submitPlayerInspect() {
        String playerName = null;

        // 1. Extract typed text from active text field box
        if (a.L != null && a.L.d != null) {
            playerName = a.L.d.d();
        }

        // 2. Close input dialog screen
        a.j();

        // 3. Process inspection request
        if (playerName != null && playerName.trim().length() > 0) {
            inspectPlayer(playerName.trim());
        } else {
            a.a("Please enter a valid player name!");
        }
    }

    /**
     * Programmatically requests full player info for any target player by name string.
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
