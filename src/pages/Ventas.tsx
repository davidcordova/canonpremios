import React from "react";

function Ventas() {
  return (
    <div className="container">
      <div>
        {/* Header */}
        <div>
          <h1>Ventas</h1>
        </div>

        {/* Table */}
        <table className="w-full">
          <thead>
            <tr>
              <th>ID</th>
              <th>Fecha</th>
              <th>Cliente</th>
              <th>Producto</th>
              <th>Cantidad</th>
              <th>Precio Unitario</th>
              <th>Total</th>
              <th>Comisión</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            {/* Table rows will be added here */}
          </tbody>
        </table>
      </div>
    </div>
  );
}



export default Ventas;