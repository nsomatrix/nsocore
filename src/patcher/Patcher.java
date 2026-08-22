package patcher;

import javassist.*;
import javassist.expr.*;

public class Patcher {
    public static void main(String[] args) {
        String inputJarPath = args.length > 0 ? args[0] : "input/NinjaSchool_217w.jar";
        String modBuildPath = args.length > 1 ? args[1] : "build_output/classes";
        String outputPath = args.length > 2 ? args[2] : "build_output/patched_classes";

        try {
            System.out.println("[NSO Core Patcher] Loading bytecode workspace...");
            ClassPool pool = ClassPool.getDefault();
            pool.insertClassPath(inputJarPath);
            pool.insertClassPath("lib/midpapi20.jar");
            pool.insertClassPath("lib/cldcapi11.jar");
            pool.insertClassPath(modBuildPath);

            CtClass dgClass = pool.get("dg");

            // 1. Hook Main Menu Creation: Insert Matrix menu entry inside dg.ah()
            System.out.println("[NSO Core Patcher] Injecting Matrix menu hook into dg.ah()...");
            CtMethod ahMethod = dgClass.getDeclaredMethod("ah");
            ahMethod.instrument(new ExprEditor() {
                public void edit(MethodCall m) throws CannotCompileException {
                    if (m.getMethodName().equals("a") && m.getClassName().equals("ds")) {
                        m.replace("{ mod.MatrixMod.addMatrixMenuItem($1); $_ = $proceed($$); }");
                    }
                }
            });

            // 2. Hook Command Handler: Insert Matrix command trigger inside dg.b(int, Object)
            System.out.println("[NSO Core Patcher] Injecting Matrix command handler into dg.b()...");
            CtClass[] params = new CtClass[]{ CtClass.intType, pool.get("java.lang.Object") };
            CtMethod bMethod = dgClass.getDeclaredMethod("b", params);
            bMethod.insertBefore("{ if (mod.MatrixMod.handleMatrixCommand($1)) return; }");

            dgClass.writeFile(outputPath);
            System.out.println("[NSO Core Patcher] Patching complete! Patched classes saved to " + outputPath);
        } catch (Exception e) {
            System.err.println("[NSO Core Patcher] Patching Failed!");
            e.printStackTrace();
            System.exit(1);
        }
    }
}
