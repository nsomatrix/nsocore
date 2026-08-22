package mod.web;

import javax.microedition.io.Connector;
import javax.microedition.io.HttpConnection;
import java.io.OutputStream;
import java.io.InputStream;
import bp;
import df;
import mod.log.MatrixLogger;

/**
 * MatrixWebClient — Asynchronous HTTP REST API Engine for J2ME.
 * 
 * Provides non-blocking streaming of player profiles and telemetry
 * to remote REST endpoints using J2ME MIDP 2.0 HttpConnection.
 */
public class MatrixWebClient {

    public static boolean enableWebSync = true;
    public static String restApiEndpoint = "http://localhost:8080/api/v1/players";

    /**
     * Asynchronously posts player profile stats to the configured REST API endpoint.
     */
    public static void postPlayerStats(final bp player) {
        if (!enableWebSync || player == null || player.ab == null || player.ab.trim().length() == 0) {
            return;
        }

        // Extract class name
        String classNameVal = "Unknown";
        if (player.av != null && player.av.b != null) {
            classNameVal = player.av.b;
        }
        final String className = classNameVal;

        // Extract school name
        String schoolNameVal = "Unknown";
        try {
            int schoolId = player.a();
            if (df.eK != null && schoolId >= 0 && schoolId < df.eK.length) {
                schoolNameVal = df.eK[schoolId];
            }
        } catch (Exception e) {}
        final String schoolName = schoolNameVal;

        // Run HTTP request on worker thread to avoid blocking main J2ME loop
        Thread webThread = new Thread(new Runnable() {
            public void run() {
                HttpConnection conn = null;
                OutputStream os = null;
                InputStream is = null;
                try {
                    String jsonPayload = buildPlayerJson(player, className, schoolName);

                    MatrixLogger.log("WEB-REST", "Sending REST POST to " + restApiEndpoint + " for: \"" + player.ab + "\"");

                    conn = (HttpConnection) Connector.open(restApiEndpoint, Connector.READ_WRITE, true);
                    conn.setRequestMethod(HttpConnection.POST);
                    conn.setRequestProperty("Content-Type", "application/json");
                    conn.setRequestProperty("User-Agent", "NSOCore-MatrixAPI/1.0 (J2ME MIDP2.0)");

                    byte[] data = jsonPayload.getBytes("UTF-8");
                    conn.setRequestProperty("Content-Length", Integer.toString(data.length));

                    os = conn.openOutputStream();
                    os.write(data);
                    os.flush();

                    int responseCode = conn.getResponseCode();
                    MatrixLogger.log("WEB-REST", "REST Response Code: " + responseCode + " for target: " + player.ab);

                    // Read response if available
                    if (responseCode == HttpConnection.HTTP_OK || responseCode == HttpConnection.HTTP_CREATED) {
                        is = conn.openInputStream();
                        StringBuffer sb = new StringBuffer();
                        int ch;
                        while ((ch = is.read()) != -1) {
                            sb.append((char) ch);
                        }
                        MatrixLogger.log("WEB-REST", "Server Response: " + sb.toString());
                    }
                } catch (Exception e) {
                    MatrixLogger.log("WEB-REST", "REST Request Warning (Server offline or unreachable): " + e.getMessage());
                } finally {
                    try { if (os != null) os.close(); } catch (Exception ex) {}
                    try { if (is != null) is.close(); } catch (Exception ex) {}
                    try { if (conn != null) conn.close(); } catch (Exception ex) {}
                }
            }
        });
        webThread.start();
    }

    /**
     * Constructs a valid CLDC 1.1 JSON string payload for player profile attributes.
     */
    private static String buildPlayerJson(bp player, String className, String schoolName) {
        StringBuffer sb = new StringBuffer();
        sb.append("{");
        sb.append("\"name\":").append(quote(player.ab)).append(",");
        sb.append("\"level\":").append(player.w).append(",");
        sb.append("\"class\":").append(quote(className)).append(",");
        sb.append("\"school\":").append(quote(schoolName)).append(",");
        sb.append("\"hp\":").append(player.z).append(",");
        sb.append("\"maxHp\":").append(player.B).append(",");
        sb.append("\"mp\":").append(player.x).append(",");
        sb.append("\"maxMp\":").append(player.y).append(",");
        sb.append("\"speed\":").append(player.b()).append(",");
        sb.append("\"attackMin\":").append(player.u - player.u / 10).append(",");
        sb.append("\"attackMax\":").append(player.u).append(",");
        sb.append("\"antiFire\":").append(player.aG).append(",");
        sb.append("\"antiIce\":").append(player.aH).append(",");
        sb.append("\"antiWind\":").append(player.aI).append(",");
        sb.append("\"reducePain\":").append(player.v).append(",");
        sb.append("\"accurate\":").append(player.aK).append(",");
        sb.append("\"dodge\":").append(player.aJ).append(",");
        sb.append("\"critical\":").append(player.aL).append(",");
        sb.append("\"counterStrike\":").append(player.aO).append(",");
        sb.append("\"antiChakra\":").append(player.aP).append(",");
        sb.append("\"antiChakraBack\":").append(player.aQ);
        sb.append("}");
        return sb.toString();
    }

    private static String quote(String input) {
        if (input == null) return "\"\"";
        StringBuffer out = new StringBuffer("\"");
        for (int i = 0; i < input.length(); i++) {
            char c = input.charAt(i);
            if (c == '"') out.append("\\\"");
            else if (c == '\\') out.append("\\\\");
            else if (c == '\n') out.append("\\n");
            else if (c == '\r') out.append("\\r");
            else out.append(c);
        }
        out.append("\"");
        return out.toString();
    }
}
