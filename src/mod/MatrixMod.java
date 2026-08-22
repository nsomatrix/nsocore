package mod;

import main.a;
import bd;
import aa;

public class MatrixMod {
    // Mod Settings State
    public static boolean speedHack = false;
    public static int speedMultiplier = 2;
    public static boolean autoFarm = false;
    public static boolean autoPotion = false;

    /**
     * Appends Matrix Mod menu entry into the main game menu vector.
     */
    public static void addMatrixMenuItem(aa vector) {
        bd matrixBtn = new bd("Matrix Mod", 888999);
        vector.addElement(matrixBtn);
    }

    /**
     * Handles custom Matrix command triggers.
     */
    public static boolean handleMatrixCommand(int commandId) {
        if (commandId == 888999) {
            showMatrixMenu();
            return true;
        }
        return false;
    }

    /**
     * Displays Matrix Mod status dialog overlay.
     */
    public static void showMatrixMenu() {
        String text = "--- NSO Matrix Mod ---\n"
                + "[1] Speed Hack: " + (speedHack ? "ON (" + speedMultiplier + "x)" : "OFF") + "\n"
                + "[2] Auto Farm: " + (autoFarm ? "ON" : "OFF") + "\n"
                + "[3] Auto Potion: " + (autoPotion ? "ON" : "OFF") + "\n"
                + "\nStatus: Engine Active & Ready!";
        a.a(text);
    }
}
