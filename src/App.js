import React, { useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { v4 as uuidv4 } from "uuid";
import Input from "./components/ui/input";
import Textarea from "./components/ui/textarea";
import Button from "./components/ui/button";
// import generarPDF from './generarPDF';

const supabaseUrl = 'https://plaglyjhbwmfmkssleie.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBsYWdseWpoYndtZm1rc3NsZWllIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczMTg5NTIxOSwiZXhwIjoyMDQ3NDcxMjE5fQ._0eOYhlPsxThAx3lxkhxKfZ0Oz-_2uOtsrwpj-J1W7I';
const supabase = createClient(supabaseUrl, supabaseKey);




// const supabase = createClient("https://TU_PROYECTO.supabase.co", "TU_API_KEY");

const App = () => {
  const [form, setForm] = useState({
    delegacion: "",
    direccion: "",
    responsable: "",
    fecha_llenado: new Date().toISOString().slice(0, 10),
    estado_inmueble: "Bueno",
    observaciones: "",
    necesidades: "",
    cuenta_auditorio: "No",
    condiciones_auditorio: "",
    articulos: [],
    fotos_delegacion: [],
    fotos_auditorio: [],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInput = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const addArticulo = () => {
    setForm(prev => ({
      ...prev,
      articulos: [
        ...prev.articulos,
        { 
          articulo: "", 
          cantidad: 0, 
          estado: "Bueno", 
          observaciones: "", 
          fotos: [] 
        },
      ],
    }));
  };

  const removeArticulo = (index) => {
    setForm(prev => {
      const articulos = [...prev.articulos];
      articulos.splice(index, 1);
      return { ...prev, articulos };
    });
  };

  const handleArticuloChange = (index, field, value) => {
    setForm(prev => {
      const updated = [...prev.articulos];
      updated[index][field] = field === "cantidad" ? Number(value) : value;
      
      if (field === "cantidad" && updated[index].fotos?.length > value) {
        updated[index].fotos = updated[index].fotos.slice(0, value);
      }
      
      return { ...prev, articulos: updated };
    });
  };

  const handleFotoChange = async (index, evidenciaIndex, file) => {
    if (!file) return;
    
    setIsSubmitting(true);
    try {
      const filename = `delegaciones/${form.delegacion}/${uuidv4()}-${file.name}`;
      const { error } = await supabase.storage.from("evidenciasinventario").upload(filename, file);
      
      if (!error) {
        const { data: urlData } = supabase.storage.from("evidenciasinventario").getPublicUrl(filename);
        setForm(prev => {
          const updated = [...prev.articulos];
          if (!updated[index].fotos) updated[index].fotos = [];
          updated[index].fotos[evidenciaIndex] = {
            url: urlData.publicUrl,
            estado: "",
            nombre: file.name
          };
          return { ...prev, articulos: updated };
        });
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      alert("Error al subir la imagen");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEstadoFotoChange = (index, evidenciaIndex, estado) => {
    setForm(prev => {
      const updated = [...prev.articulos];
      if (updated[index].fotos && updated[index].fotos[evidenciaIndex]) {
        updated[index].fotos[evidenciaIndex].estado = estado;
      }
      return { ...prev, articulos: updated };
    });
  };

  const validateForm = () => {
    if (!form.delegacion.trim()) {
      alert("Por favor ingrese la delegación");
      return false;
    }
    // if (!form.responsable.trim()) {
    //   alert("Por favor ingrese el responsable");
    //   return false;
    // }
    
    // for (let i = 0; i < form.articulos.length; i++) {
    //   const art = form.articulos[i];
    //   if (!art.articulo.trim()) {
    //     alert(`Por favor ingrese el nombre del artículo #${i + 1}`);
    //     return false;
    //   }
    //   if (art.cantidad <= 0) {
    //     alert(`La cantidad del artículo "${art.articulo}" debe ser mayor a 0`);
    //     return false;
    //   }
    // }
    
    // return true;


    for (let i = 0; i < form.articulos.length; i++) {
  const art = form.articulos[i];
  if (!art.articulo.trim()) {
    alert(`Por favor ingrese el nombre del artículo #${i + 1}`);
    return false;
  }
  if (art.cantidad <= 0) {
    alert(`La cantidad del artículo "${art.articulo}" debe ser mayor a 0`);
    return false;
  }
  if (!art.estado) {
    alert(`Seleccione el estado del artículo "${art.articulo}"`);
    return false;
  }
  if (!art.fotos || art.fotos.length < art.cantidad || art.fotos.some(f => !f.url)) {
    alert(`Debe subir todas las evidencias del artículo "${art.articulo}"`);
    return false;
  }
}

return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const { error } = await supabase.from("inventario_delegaciones").insert({
        ...form,
        articulos_json: form.articulos,
        fotos_delegacion: form.fotos_delegacion,
        fotos_auditorio: form.fotos_auditorio,
      });
      
      if (error) throw error;
      // await generarPDF(form); // Llama esto después de guardar exitosamente

      alert("Inventario enviado correctamente");
      setForm({
        delegacion: "",
        direccion: "",
        responsable: "",
        fecha_llenado: new Date().toISOString().slice(0, 10),
        estado_inmueble: "Bueno",
        observaciones: "",
        necesidades: "",
        cuenta_auditorio: "No",
        condiciones_auditorio: "",
        articulos: [],
      });
    } catch (error) {
      console.error("Submission error:", error);
      alert(`Error al enviar: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };
const delegacionesCatalogo = [
"TECAMAC DE FELIPE VILLANUEVA" ,"SAN FRANCISCO CUAUTLIQUIXCA" ,"SAN PEDRO ATZOMPA" ,"SANTA MARIA OZUMBILLA" ,"SAN PABLO TECALCO" ,"SAN JERONIMO XONACAHUACAN" ,"SAN PEDRO POZOHUACAN" ,"SANTA MARIA AJOLOAPAN" ,"SANTO DOMINGO AJOLOAPAN" ,"REYES ACOZAC" ,"SAN LUCAS XOLOX" ,"SAN JUAN PUEBLO NUEVO" ,"FRACCIONAMIENTO OJO DE AGUA" ,"COLONIA 5 DE MAYO" ,"SAN MARTIN AZCATEPEC" ,"SAN MATEO TECALCO" ,"EJIDOS DE TECAMAC" ,"LOMA BONITA" ,"HUEYOTENCO" ,"COLONIA ESMERALDA" ,"LOMAS DE TECAMAC" ,"GEO SIERRA HERMOSA" ,"LOS HEROES OZUMBILLA" ,"LOS HEROES SAN PABLO" ,"LOS HEROES SECCIÓN FLORES" ,"LOS HEROES SECCIÓN JARDINES" ,"LOS HEROES SECCIÓN BOSQUES" ,"LOS HEROES SEXTA SECCIÓN" ,"VILLA DEL REAL 1,2,3" ,"VILLA DEL REAL 4,5,6" ,"VALLE SAN PEDRO (URBI)" ,"RANCHO LA CAPILLA (SANTA CRUZ)" ,"SAN JOSE" ,"COLONIA SANTA CRUZ" ,"MARGARITO F. AYALA" ,"LOS OLIVOS" ,"COLONIA LOS ARCOS" ,"LOMAS DE OZUMBILLA Y VISTA HERMOSA" ,"AMPLIACIÓN ESMERALDA" ,"GALAXIAS DEL LLANO" ,"HACIENDAS DEL BOSQUE" ,"PORTAL OJO DE AGUA" ,"PROVENZAL DEL BOSQUE" ,"REAL CARRARA, REAL CASTELL, REAL FIRENZE" ,"REAL DEL CID" ,"REAL TOSCANA, REAL DEL SOL " ,"REAL GRANADA" ,"REAL VERONA" ,"FRACCIONAMIENTO RANCHO  LA LUZ"
];
  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold text-center mb-6">Inventario Delegacional</h1>
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Información General</h2>
        

        <div>
  <label className="block mb-1 font-medium">Delegación *</label>
  <input
    list="delegaciones"
    name="delegacion"
    value={form.delegacion}
    onChange={handleInput}
    placeholder="Selecciona o escribe una delegación"
    className="border rounded px-3 py-2 w-full"
    required
  />
  <datalist id="delegaciones">
    {delegacionesCatalogo.map((d) => (
      <option key={d} value={d} />
    ))}
  </datalist>
</div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block mb-2 font-medium">Estado del inmueble *</label>
            <select 
              name="estado_inmueble" 
              value={form.estado_inmueble}
              onChange={handleInput} 
              className="border rounded px-3 py-2 w-full"
              required
            >
              <option value="Bueno">Bueno</option>
              <option value="Regular">Regular</option>
              <option value="Malo">Malo</option>
            </select>
          </div>
          
          {/* <Textarea 
            name="observaciones" 
            placeholder="Observaciones estructurales" 
            value={form.observaciones}
            onChange={handleInput} 
            rows={3}
            label="Observaciones"
          /> */}
          


          
          <Textarea 
            name="necesidades" 
            placeholder="Necesidades de mantenimiento" 
            value={form.necesidades}
            onChange={handleInput} 
            rows={3}
            label="Necesidades"
          />
        </div>

        <div className="mt-6">
        <label className="block font-medium mb-2">Fotos de la delegación (6 imágenes)</label>
        {[...Array(6)].map((_, i) => (
          <div key={i} className="mb-2">
            <Input
              type="file"
              accept="image/*"
              onChange={async (e) => {
                const file = e.target.files[0];
                if (!file) return;
                const filename = `delegacion_fotos/${form.delegacion}/${uuidv4()}-${file.name}`;
                const { error } = await supabase.storage.from("evidenciasinventario").upload(filename, file);
                if (!error) {
                  const { data } = supabase.storage.from("evidenciasinventario").getPublicUrl(filename);
                  setForm(prev => {
                    const updated = [...(prev.fotos_delegacion || [])];
                    updated[i] = data.publicUrl;
                    return { ...prev, fotos_delegacion: updated };
                  });
                }
              }}
            />
            {form.fotos_delegacion?.[i] && (
              <p className="text-green-600 text-sm mt-1">✓ Subida: <a className="underline text-blue-600" href={form.fotos_delegacion[i]} target="_blank" rel="noreferrer">Ver</a></p>
            )}
          </div>
        ))}
      </div>


        
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Inventario Patrimonial</h2>
          <Button onClick={addArticulo} variant="secondary">
            + Agregar Artículo
          </Button>
        </div>
        
        {form.articulos.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No hay artículos agregados aún
          </div>
        ) : (
          <div className="space-y-4">
            {form.articulos.map((art, index) => (
              <div key={index} className="border rounded p-4 space-y-4 bg-gray-50">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
                  <Input
                    value={art.articulo}
                    onChange={(e) => handleArticuloChange(index, "articulo", e.target.value)}
                    placeholder="Nombre del artículo *"
                    label={`Artículo ${index + 1}`}
                    required
                  />
                  <Input
                    type="number"
                    min="1"
                    value={art.cantidad}
                    onChange={(e) => handleArticuloChange(index, "cantidad", e.target.value)}
                    placeholder="Cantidad *"
                    label="Cantidad"
                    required
                  />
                  <Button 
                    onClick={() => removeArticulo(index)} 
                    variant="danger"
                    // className="h-[42px]"
                  >
                    Eliminar
                  </Button>
                </div>
                
                {art.cantidad > 0 && (
                  <div className="space-y-3">
                    <p className="font-medium">Evidencias fotográficas:</p>
                    <div className="grid grid-cols-1 gap-3">
                      {[...Array(art.cantidad)].map((_, i) => (
                        <div key={i} className="flex flex-col md:flex-row gap-3 items-start md:items-center">
                          <div className="flex-1">
                            <Input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleFotoChange(index, i, e.target.files[0])}
                              disabled={isSubmitting}
                              required
                              label={`Evidencia ${i + 1}`}
                            />
                            {art.fotos?.[i]?.url && (
                              <div className="mt-1 text-sm text-green-600 flex items-center">
                                <span className="mr-2">✓ {art.fotos[i].nombre}</span>
                                <a 
                                  href={art.fotos[i].url} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-blue-500 hover:underline"
                                >
                                  (Ver)
                                </a>
                              </div>
                            )}
                          </div>
                          
                          <div className="w-full md:w-32">
                            <label className="block mb-1 text-sm font-medium">Estado</label>
                            <select
                              value={art.fotos?.[i]?.estado} // Corregido el operador ||
                              onChange={(e) => handleEstadoFotoChange(index, i, e.target.value)}
                              className="border rounded px-3 py-2 w-full"
                              disabled={!art.fotos?.[i]?.url}
                            >
                              <option value="Bueno">Bueno</option>
                              <option value="Regular">Regular</option>
                              <option value="Malo">Malo</option>
                            </select>
                          </div>

                          
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}


        
      </div>

      <div className="mb-6">
          <label className="block mb-2 font-medium">¿Cuenta con auditorio? *</label>
          <select
            name="cuenta_auditorio"
            value={form.cuenta_auditorio}
            onChange={handleInput}
            className="border rounded px-3 py-2 w-full md:w-1/4"
            required
          >
            <option value="No">No</option>
            <option value="Sí">Sí</option>
          </select>

          {form.cuenta_auditorio === "Sí" && (
  <>
    <div className="mt-4">
      <label className="block mb-1 text-sm font-medium">Estado del auditorio</label>
      <select
        name="estado_auditorio"
        value={form.estado_auditorio}
        onChange={handleInput}
        className="border rounded px-3 py-2 w-full"
      >
        <option value="Bueno">Bueno</option>
        <option value="Regular">Regular</option>
        <option value="Malo">Malo</option>
      </select>
    </div>

    {/* <div className="mt-4">
      <label className="block mb-1 text-sm font-medium">Estado de la pintura</label>
      <select
        name="estado_pintura"
        value={form.estado_pintura}
        onChange={handleInput}
        className="border rounded px-3 py-2 w-full"
      >
        <option value="Bueno">Bueno</option>
        <option value="Regular">Regular</option>
        <option value="Malo">Malo</option>
      </select>
    </div> */}

    {/* <div className="mt-4">
      <label className="block mb-1 text-sm font-medium">Evidencia fotográfica del auditorio</label>
      <input
        type="file"
        accept="image/*"
        className="border rounded px-3 py-2 w-full"
        onChange={async (e) => {
          const file = e.target.files[0];
          if (!file) return;
          const filename = `auditorio/${form.delegacion}/${uuidv4()}-${file.name}`;
          const { error } = await supabase.storage.from("evidencias").upload(filename, file);
          if (!error) {
            const { data } = supabase.storage.from("evidencias").getPublicUrl(filename);
            setForm((prev) => ({
              ...prev,
              foto_auditorio_url: data.publicUrl,
              foto_auditorio_nombre: file.name,
            }));
          }
        }}
      />
      {form.foto_auditorio_url && (
        <div className="mt-2 text-sm text-green-600">
          ✓ {form.foto_auditorio_nombre} —
          <a
            href={form.foto_auditorio_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 underline ml-1"
          >
            Ver
          </a>
        </div>
      )}
    </div> */}

        {form.cuenta_auditorio === "Sí" && (
      <div className="mt-6">
        <label className="block font-medium mb-2">Fotos del auditorio (6 imágenes)</label>
        {[...Array(6)].map((_, i) => (
          <div key={i} className="mb-2">
            <Input
              type="file"
              accept="image/*"
              onChange={async (e) => {
                const file = e.target.files[0];
                if (!file) return;
                const filename = `auditorio_fotos/${form.delegacion}/${uuidv4()}-${file.name}`;
                const { error } = await supabase.storage.from("evidenciasinventario").upload(filename, file);
                if (!error) {
                  const { data } = supabase.storage.from("evidenciasinventario").getPublicUrl(filename);
                  setForm(prev => {
                    const updated = [...(prev.fotos_auditorio || [])];
                    updated[i] = data.publicUrl;
                    return { ...prev, fotos_auditorio: updated };
                  });
                }
              }}
            />
            {form.fotos_auditorio?.[i] && (
              <p className="text-green-600 text-sm mt-1">✓ Subida: <a className="underline text-blue-600" href={form.fotos_auditorio[i]} target="_blank" rel="noreferrer">Ver</a></p>
            )}
          </div>
        ))}
      </div>
    )}

    
    <div className="mt-4">
      <Textarea
        name="condiciones_auditorio"
        placeholder="Describa las condiciones del auditorio"
        value={form.condiciones_auditorio}
        onChange={handleInput}
        rows={2}
        label="Condiciones del auditorio"
        required
      />
    </div>
  </>
)}

        </div>

      <div className="flex justify-center">
        <Button 
          onClick={handleSubmit} 
          disabled={isSubmitting}
          // className="px-8 py-3 text-lg"
        >
          {isSubmitting ? (
            <span className="flex items-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Enviando...
            </span>
          ) : "Guardar Inventario"}
        </Button>
      </div>
    </div>
  );
};

export default App;