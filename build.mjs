import { execSync } from "child_process";
import fs from "fs";
import path from "path";

try {
  console.log("Memulai kompilasi Vite secara langsung lewat Node...");
  // Memanggil binary Vite langsung dari node_modules dengan batas memori 4096MB
  execSync(`node --max-old-space-size=4096 node_modules/vite/bin/vite.js build`, { stdio: "inherit" });


  
  console.log("Kompilasi selesai. Memulai pembersihan tag crossorigin...");
  const distHtmlPath = path.join("dist", "index.html");
  
  if (fs.existsSync(distHtmlPath)) {
    let content = fs.readFileSync(distHtmlPath, "utf8");
    content = content.replace(/\scrossorigin/g, "");
    fs.writeFileSync(distHtmlPath, content, "utf8");
    console.log("Tag 'crossorigin' berhasil dibersihkan dari dist/index.html.");
    
    // Copy ke file target
    fs.copyFileSync(distHtmlPath, "Dashboard-for-Spreadsheet.html");
    fs.copyFileSync(distHtmlPath, "Dashboard-for-Spreadsheet.txt");
    console.log("Berhasil menyalin dist/index.html ke Dashboard-for-Spreadsheet.html dan Dashboard-for-Spreadsheet.txt.");
  } else {
    console.error("Gagal menemukan file dist/index.html!");
  }
} catch (error) {
  console.error("Terjadi kesalahan saat build:", error.message);
  process.exit(1);
}
