"use client";

import { useState } from "react";
import { Download, Loader2 } from "lucide-react";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import { Button } from "@/components/ui/button";

export function DownloadPdfButton({ label = "Download PDF" }: { label?: string }) {
  const [isDownloading, setIsDownloading] = useState(false);

  async function downloadPdf() {
    const source = document.querySelector<HTMLElement>(".printable-itinerary");
    if (!source || isDownloading) return;

    setIsDownloading(true);
    let exportRoot: HTMLElement | null = null;

    try {
      // The itinerary remains hidden in the live page. Render a temporary clone
      // off-screen so the PDF uses the existing itinerary design without
      // changing the interactive page or opening the browser print dialog.
      exportRoot = source.cloneNode(true) as HTMLElement;
      exportRoot.classList.remove("hidden");
      exportRoot.classList.remove("print:block");
      exportRoot.classList.remove("print:bg-white", "print:text-black");
      exportRoot.style.position = "fixed";
      exportRoot.style.left = "-10000px";
      exportRoot.style.top = "0";
      exportRoot.style.width = "190mm";
      exportRoot.style.backgroundColor = "#ffffff";
      exportRoot.style.color = "#000000";
      exportRoot.style.zIndex = "-1";
      document.body.appendChild(exportRoot);

      // Airline logos are loaded from an external provider. Embed each logo
      // as a data URL in the temporary clone so the canvas keeps the actual
      // logo without becoming tainted by a cross-origin image.
      await Promise.all(
        [...exportRoot.querySelectorAll<HTMLImageElement>("img")].map(async (image) => {
          if (!image.src.startsWith("http")) return;
          try {
            const response = await fetch(image.src, { mode: "cors" });
            if (!response.ok) return;
            const blob = await response.blob();
            image.src = await new Promise<string>((resolve, reject) => {
              const reader = new FileReader();
              reader.onload = () => resolve(String(reader.result));
              reader.onerror = () => reject(reader.error);
              reader.readAsDataURL(blob);
            });
          } catch {
            // The original image remains in place if the provider does not
            // allow CORS. html2canvas can still render it when permitted.
          }
        })
      );

      await document.fonts.ready;
      const canvas = await html2canvas(exportRoot, {
        backgroundColor: "#ffffff",
        scale: 2,
        useCORS: true,
        logging: false,
      });

      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const pageWidth = 210;
      const pageHeight = 297;
      const imageHeight = (canvas.height * pageWidth) / canvas.width;
      const imageData = canvas.toDataURL("image/png");
      const pageCount = Math.max(1, Math.ceil(imageHeight / pageHeight));

      for (let page = 0; page < pageCount; page += 1) {
        if (page > 0) pdf.addPage();
        pdf.addImage(imageData, "PNG", 0, -page * pageHeight, pageWidth, imageHeight);
      }

      pdf.save("skybook-itinerary.pdf");
    } catch (error) {
      console.error("Unable to download itinerary PDF", error);
      window.alert("The itinerary PDF could not be downloaded. Please try again.");
    } finally {
      exportRoot?.remove();
      setIsDownloading(false);
    }
  }

  return (
    <Button variant="outline" onClick={downloadPdf} disabled={isDownloading} aria-busy={isDownloading}>
      {isDownloading ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />} {isDownloading ? "Preparing PDF…" : label}
    </Button>
  );
}
