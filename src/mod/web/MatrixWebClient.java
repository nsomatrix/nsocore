package mod.web;

import javax.microedition.io.Connector;
import javax.microedition.io.HttpConnection;
import javax.microedition.rms.RecordStore;
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
    public static boolean enablePolling = true;
    public static String restApiEndpoint = loadEndpointFromRMS();
    private static Thread pollThread = null;

    /**
     * Resolves the full POST players API URL regardless of how user entered it.
     */
    public static String getPlayersEndpointUrl() {
        if (restApiEndpoint == null || restApiEndpoint.trim().length() == 0) return null;
        String base = restApiEndpoint.trim();
        if (base.endsWith("/")) {
            base = base.substring(0, base.length() - 1);
        }
        if (base.endsWith("/api/v1/inspect")) {
            return base.substring(0, base.length() - 15) + "/api/v1/players";
        }
        if (base.endsWith("/api/v1/players")) {
            return base;
        }
        if (base.endsWith("/api/v1")) {
            return base + "/players";
        }
        return base + "/api/v1/players";
    }

    /**
     * Resolves the full GET inspect API URL regardless of how user entered it.
     */
    public static String getInspectEndpointUrl() {
        if (restApiEndpoint == null || restApiEndpoint.trim().length() == 0) return null;
        String base = restApiEndpoint.trim();
        if (base.endsWith("/")) {
            base = base.substring(0, base.length() - 1);
        }
        if (base.endsWith("/api/v1/players")) {
            return base.substring(0, base.length() - 15) + "/api/v1/inspect";
        }
        if (base.endsWith("/api/v1/inspect")) {
            return base;
        }
        if (base.endsWith("/api/v1")) {
            return base + "/inspect";
        }
        return base + "/api/v1/inspect";
    }

    /**
     * Starts background worker thread polling the remote REST server for queued inspect targets.
     */
    public static synchronized void startPollingLoop() {
        if (pollThread != null && pollThread.isAlive()) return;

        pollThread = new Thread(new Runnable() {
            public void run() {
                MatrixLogger.log("WEB-REST", "Background Inspection Poller active! Inspect URL: " + getInspectEndpointUrl());
                while (enableWebSync && enablePolling) {
                    try {
                        Thread.sleep(4000); // Poll every 4 seconds
                        checkPendingInspectTarget();
                    } catch (Exception e) {
                    }
                }
            }
        });
        pollThread.start();
    }

    private static void checkPendingInspectTarget() {
        if (!enableWebSync || restApiEndpoint == null || restApiEndpoint.trim().length() == 0) return;

        String inspectUrl = getInspectEndpointUrl();
        if (inspectUrl == null) return;

        HttpConnection conn = null;
        InputStream is = null;
        try {
            conn = (HttpConnection) Connector.open(inspectUrl, Connector.READ, true);
            conn.setRequestMethod(HttpConnection.GET);
            conn.setRequestProperty("User-Agent", "NSOCore-MatrixAPI/1.0 (J2ME MIDP2.0)");

            int code = conn.getResponseCode();
            if (code == HttpConnection.HTTP_OK) {
                is = conn.openInputStream();
                StringBuffer sb = new StringBuffer();
                int ch;
                while ((ch = is.read()) != -1) {
                    sb.append((char) ch);
                }
                String resp = sb.toString();
                String target = extractTargetFromJson(resp);
                if (target != null && target.trim().length() > 0) {
                    MatrixLogger.log("WEB-REST", "Received Remote Inspection Target from Web: \"" + target + "\"");
                    mod.net.MatrixNet.inspectPlayer(target.trim(), true); // fromWeb = true
                }
            }
        } catch (Exception e) {
            MatrixLogger.log("WEB-REST", "Poll Check Warning (" + inspectUrl + "): " + e.getMessage());
        } finally {
            try { if (is != null) is.close(); } catch (Exception ex) {}
            try { if (conn != null) conn.close(); } catch (Exception ex) {}
        }
    }

    private static String extractTargetFromJson(String json) {
        if (json == null) return null;
        int idx = json.indexOf("\"target\":");
        if (idx == -1) return null;
        int startQuote = json.indexOf("\"", idx + 9);
        if (startQuote == -1) return null;
        int endQuote = json.indexOf("\"", startQuote + 1);
        if (endQuote == -1) return null;
        String val = json.substring(startQuote + 1, endQuote);
        if ("null".equals(val) || val.trim().length() == 0) return null;
        return val;
    }

    /**
     * Dynamically updates and persists the REST API Endpoint URL in J2ME RMS storage.
     */
    public static void setRestEndpoint(String newUrl) {
        if (newUrl != null && newUrl.trim().length() > 0) {
            restApiEndpoint = newUrl.trim();
            saveEndpointToRMS(restApiEndpoint);
            MatrixLogger.log("WEB-REST", "REST API Endpoint updated & saved: " + restApiEndpoint);
            startPollingLoop(); // Restart poller with new URL
        }
    }

    private static String loadEndpointFromRMS() {
        RecordStore rs = null;
        try {
            rs = RecordStore.openRecordStore("MatrixWebConfig", true);
            if (rs.getNumRecords() > 0) {
                byte[] data = rs.getRecord(1);
                if (data != null && data.length > 0) {
                    return new String(data, "UTF-8");
                }
            }
        } catch (Exception e) {
        } finally {
            try { if (rs != null) rs.closeRecordStore(); } catch (Exception e) {}
        }
        return "http://localhost:3000/api/v1/players"; // Default fallback
    }

    private static void saveEndpointToRMS(String url) {
        RecordStore rs = null;
        try {
            rs = RecordStore.openRecordStore("MatrixWebConfig", true);
            byte[] data = url.getBytes("UTF-8");
            if (rs.getNumRecords() == 0) {
                rs.addRecord(data, 0, data.length);
            } else {
                rs.setRecord(1, data, 0, data.length);
            }
        } catch (Exception e) {
            MatrixLogger.log("WEB-REST", "RMS Save Error: " + e.getMessage());
        } finally {
            try { if (rs != null) rs.closeRecordStore(); } catch (Exception e) {}
        }
    }

    private static String lastPostedPlayer = "";
    private static long lastPostTime = 0;

    /**
     * Asynchronously posts player profile stats to the configured REST API endpoint.
     */
    public static void postPlayerStats(final bp player) {
        if (!enableWebSync || player == null || player.ab == null || player.ab.trim().length() == 0) {
            return;
        }

        // Deduplicate rapid frame repaint calls (3 second cooldown per player name)
        long now = System.currentTimeMillis();
        if (player.ab.equals(lastPostedPlayer) && (now - lastPostTime < 3000)) {
            return;
        }
        lastPostedPlayer = player.ab;
        lastPostTime = now;

        final String postUrl = getPlayersEndpointUrl();
        if (postUrl == null) return;

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

                    MatrixLogger.log("WEB-REST", "Sending REST POST to " + postUrl + " for: \"" + player.ab + "\"");

                    conn = (HttpConnection) Connector.open(postUrl, Connector.READ_WRITE, true);
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
