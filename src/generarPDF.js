// Instala primero: npm install jspdf html2canvas

import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const generarPDF = async (form) => {
  const doc = new jsPDF('p', 'mm', 'a4');
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 10;
  let y = margin;

  const nuevaLinea = (txt, fontSize = 12, bold = false) => {
    doc.setFontSize(fontSize);
    doc.setFont(undefined, bold ? 'bold' : 'normal');
    const split = doc.splitTextToSize(txt, pageWidth - 2 * margin);
    doc.text(split, margin, y);
    y += split.length * (fontSize * 0.5);
  };

  nuevaLinea('INVENTARIO DELEGACIONAL', 16, true);
  nuevaLinea(`Delegación: ${form.delegacion}`);
  nuevaLinea(`Dirección: ${form.direccion}`);
  nuevaLinea(`Responsable: ${form.responsable}`);
  nuevaLinea(`Fecha de llenado: ${form.fecha_llenado}`);
  nuevaLinea(`Estado del inmueble: ${form.estado_inmueble}`);
  nuevaLinea(`Observaciones: ${form.observaciones}`);
  nuevaLinea(`Necesidades: ${form.necesidades}`);

  // Delegacion Fotos
  if (form.fotos_delegacion?.length) {
    for (const foto of form.fotos_delegacion) {
      if (y > 250) {
        doc.addPage();
        y = margin;
      }
      const img = await cargarImagen(foto.url);
      doc.addImage(img, 'JPEG', margin, y, 60, 40);
      y += 45;
    }
  }

  nuevaLinea('Inventario Patrimonial:', 14, true);

  for (const [i, art] of form.articulos.entries()) {
    nuevaLinea(`${i + 1}. ${art.articulo} (${art.cantidad}) - ${art.estado}`);
    if (art.fotos) {
      for (const f of art.fotos) {
        if (f?.url) {
          if (y > 250) {
            doc.addPage();
            y = margin;
          }
          const img = await cargarImagen(f.url);
          doc.addImage(img, 'JPEG', margin, y, 60, 40);
          doc.text(`Estado: ${f.estado}`, margin + 65, y + 5);
          y += 45;
        }
      }
    }
  }

  if (form.cuenta_auditorio === 'Sí') {
    nuevaLinea('Auditorio', 14, true);
    nuevaLinea(`Estado: ${form.estado_auditorio}`);
    nuevaLinea(`Pintura: ${form.estado_pintura}`);
    nuevaLinea(`Condiciones: ${form.condiciones_auditorio}`);

    if (form.fotos_auditorio?.length) {
      for (const foto of form.fotos_auditorio) {
        if (y > 250) {
          doc.addPage();
          y = margin;
        }
        const img = await cargarImagen(foto.url);
        doc.addImage(img, 'JPEG', margin, y, 60, 40);
        y += 45;
      }
    }
  }

  doc.save(`Inventario_${form.delegacion}.pdf`);
};

const cargarImagen = (url) => {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      resolve(canvas.toDataURL('image/jpeg'));
    };
    img.src = url;
  });
};

export default generarPDF;
