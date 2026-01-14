const API_URL = 'https://mitienda-ibgx.onrender.com'; 
const token = localStorage.getItem('jwt_token');
const rolUsuario = localStorage.getItem('user_rol');
const isGitHubPages = window.location.hostname.includes('github.io');

if (!isGitHubPages) {
    const isLoginPage = window.location.pathname.endsWith('login.html') || window.location.pathname === '/';
    
    if (!token && !isLoginPage) {
        window.location.href = 'login.html';
    } else if (token && isLoginPage) {
        window.location.href = 'index.html'; 
    }
}

const listaCategorias = document.getElementById('lista-categorias');


const btnAgregar = document.getElementById('btn-agregar');
const inputNombre = document.getElementById('nombre-categoria');
const inputDesc = document.getElementById('desc-categoria');
const listaProductos = document.getElementById('lista-productos');
const btnAgregarProducto = document.getElementById('btn-agregar-producto');
const inputProductoNombre = document.getElementById('producto-nombre');
const inputProductoMarca = document.getElementById('producto-marca');
const selectProductoCategoria = document.getElementById('producto-categoria');
const inputProductoPrecio = document.getElementById('producto-precio');
const inputProductoStock = document.getElementById('producto-stock');
const listaProveedores = document.getElementById('lista-proveedores');
const btnAgregarProveedor = document.getElementById('btn-agregar-proveedor');
const inputProvNombre = document.getElementById('prov-nombre');
const inputProvTelefono = document.getElementById('prov-telefono');
const inputProvCalle = document.getElementById('prov-calle');
const inputProvNumero = document.getElementById('prov-numero');
const inputProvColonia = document.getElementById('prov-colonia');
const inputProvCP = document.getElementById('prov-cp');

let carrito = [];

const selectVentaProducto = document.getElementById('venta-producto');
const inputVentaCantidad = document.getElementById('venta-cantidad');
const btnAgregarCarrito = document.getElementById('btn-agregar-carrito');
const listaCarrito = document.getElementById('lista-carrito');
const spanTotal = document.getElementById('carrito-total');
const btnRegistrarVenta = document.getElementById('btn-registrar-venta');

// FUNCIÓN PARA OBTENER Y MOSTRAR CATEGORÍAS
async function cargarCategorias() {
    try {
        const respuesta = await fetch(`${API_URL}/api/categorias`);
        const categorias = await respuesta.json();

        
        listaCategorias.innerHTML = '';
        selectProductoCategoria.innerHTML = ''; 

        
        const opcionDefecto = document.createElement('option');
        opcionDefecto.value = "";
        opcionDefecto.textContent = "Selecciona una categoría";
        selectProductoCategoria.appendChild(opcionDefecto);

        if (categorias.length === 0) {
            listaCategorias.innerHTML = '<li class="list-group-item">No hay categorías registradas.</li>';
        }

       categorias.forEach(categoria => {
            
            const li = document.createElement('li');
            li.className = 'list-group-item';
            li.textContent = categoria.nombre_categoria;
            listaCategorias.appendChild(li);

            
            const opcion = document.createElement('option');
            opcion.value = categoria.id_categoria; 
            opcion.textContent = categoria.nombre_categoria; 
            selectProductoCategoria.appendChild(opcion);
        });

    } catch (error) {
        console.error('Error al cargar categorías:', error);
        listaCategorias.innerHTML = `<li class="list-group-item text-danger">Error al cargar datos. Revisa la consola.</li>`;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    cargarCategorias();
});

// FUNCIÓN PARA AGREGAR UNA NUEVA CATEGORÍA
async function agregarCategoria(event) {

  event.preventDefault();

  const nombre = inputNombre.value;
  const descripcion = inputDesc.value;

  if (!nombre) {
    alert('Por favor, escribe un nombre para la categoría.');
    return;
  }

  btnAgregar.disabled = true;
  btnAgregar.textContent = 'Agregando...';

  try {

    const respuesta = await fetch(`${API_URL}/api/categorias`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json', 
      },
      body: JSON.stringify({ nombre, descripcion }), 
    });

    if (!respuesta.ok) {
      
      const errorData = await respuesta.json();
      throw new Error(errorData.error || 'Error del servidor');
    }

    
    inputNombre.value = '';
    inputDesc.value = '';

    
    await cargarCategorias();

  } catch (error) {
    console.error('Error al agregar categoría:', error);
    alert('Error al agregar categoría: ' + error.message);
  } finally {
    
    btnAgregar.disabled = false;
    btnAgregar.textContent = 'Agregar Categoría';
  }
}

if (btnAgregar) {
    btnAgregar.addEventListener('click', agregarCategoria);
}

// FUNCIÓN PARA OBTENER Y MOSTRAR PRODUCTO
async function cargarProductos() {
    try {
        const respuesta = await fetch(`${API_URL}/api/productos`);
        const productos = await respuesta.json();

        listaProductos.innerHTML = '';
        selectVentaProducto.innerHTML = ''; 

        
        const opcionVentaDefecto = document.createElement('option');
        opcionVentaDefecto.value = "";
        opcionVentaDefecto.textContent = "Selecciona un producto";
        selectVentaProducto.appendChild(opcionVentaDefecto);

        if (productos.length === 0) {
            listaProductos.innerHTML = '<li class="list-group-item">No hay productos registrados.</li>';
            return;
        }

        productos.forEach(producto => {
            const li = document.createElement('li');
            li.className = 'list-group-item d-flex justify-content-between align-items-center';

            
            li.innerHTML = `
                <div>
                    <span class="fw-bold">${producto.nombre_producto}</span>
                    <small class="text-muted d-block">${producto.marca} - ${producto.nombre_categoria}</small>
                </div>
                <span class="badge bg-primary rounded-pill">Stock: ${producto.stock}</span>
            `;
            listaProductos.appendChild(li);

            
            if (producto.stock > 0) {
                const opcion = document.createElement('option');
                opcion.value = producto.id_producto;
                
                opcion.dataset.precio = producto.precio_venta;
                opcion.dataset.nombre = producto.nombre_producto;
                opcion.textContent = `${producto.nombre_producto} ($${producto.precio_venta}) - Stock: ${producto.stock}`;
                selectVentaProducto.appendChild(opcion);
            }

        });

    } catch (error) {
        console.error('Error al cargar productos:', error);
        listaProductos.innerHTML = `<li class="list-group-item text-danger">Error al cargar productos.</li>`;
    }
}

// FUNCIÓN PARA AGREGAR UN NUEVO PRODUCTO 
async function agregarProducto(event) {
    event.preventDefault();

    const nombre = inputProductoNombre.value;
    const marca = inputProductoMarca.value;
    const precio = parseFloat(inputProductoPrecio.value);
    const stock = parseInt(inputProductoStock.value);
    const categoria_id = parseInt(selectProductoCategoria.value); 

    if (!nombre || !precio || !stock || !categoria_id) {
        alert('Por favor, completa todos los campos del producto.');
        return;
    }

    btnAgregarProducto.disabled = true;
    btnAgregarProducto.textContent = 'Agregando...';

    try {
        const respuesta = await fetch(`${API_URL}/api/productos`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nombre, marca, precio, stock, categoria_id }),
        });

        if (!respuesta.ok) {
            const errorData = await respuesta.json();
            throw new Error(errorData.error || 'Error del servidor');
        }

        
        inputProductoNombre.value = '';
        inputProductoMarca.value = '';
        inputProductoPrecio.value = '';
        inputProductoStock.value = '';
        selectProductoCategoria.value = ''; 

       
        await cargarProductos();

    } catch (error) {
        console.error('Error al agregar producto:', error);
        alert('Error al agregar producto: ' + error.message);
    } finally {
        btnAgregarProducto.disabled = false;
        btnAgregarProducto.textContent = 'Agregar Producto';
    }
}

if (btnAgregarProducto) {
    btnAgregarProducto.addEventListener('click', agregarProducto);
}
// FUNCIÓN PARA OBTENER Y MOSTRAR PROVEEDORES
async function cargarProveedores() {
    try {
        const respuesta = await fetch(`${API_URL}/api/proveedores`);
        const proveedores = await respuesta.json();

        listaProveedores.innerHTML = '';

        if (proveedores.length === 0) {
            listaProveedores.innerHTML = '<li class="list-group-item">No hay proveedores registrados.</li>';
            return;
        }

        proveedores.forEach(prov => {
            const li = document.createElement('li');
            li.className = 'list-group-item';

           
            let direccion = [prov.calle, prov.numero, prov.colonia, prov.codigo_postal]
                              .filter(Boolean) 
                              .join(', '); 

            li.innerHTML = `
                <div class="fw-bold">${prov.nombre_proveedor}</div>
                <small class="text-muted d-block">Tel: ${prov.telefono || 'No registrado'}</small>
                <small class="text-muted d-block">Dir: ${direccion || 'No registrada'}</small>
            `;
            listaProveedores.appendChild(li);
        });

    } catch (error) {
        console.error('Error al cargar proveedores:', error);
        listaProveedores.innerHTML = `<li class="list-group-item text-danger">Error al cargar proveedores.</li>`;
    }
}

// FUNCIÓN PARA AGREGAR UN NUEVO PROVEEDOR
async function agregarProveedor(event) {
    event.preventDefault();

    
    const nombre = inputProvNombre.value;
    const telefono = inputProvTelefono.value;
    const calle = inputProvCalle.value;
    const numero = inputProvNumero.value;
    const colonia = inputProvColonia.value;
    const cp = inputProvCP.value;

    if (!nombre || !telefono) {
        alert('Nombre y Teléfono son obligatorios.');
        return;
    }

    btnAgregarProveedor.disabled = true;
    btnAgregarProveedor.textContent = 'Agregando...';

    try {
        const respuesta = await fetch(`${API_URL}/api/proveedores`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nombre, calle, numero, colonia, cp, telefono }),
        });

        if (!respuesta.ok) {
            const errorData = await respuesta.json();
            throw new Error(errorData.error || 'Error del servidor');
        }

       
        inputProvNombre.value = '';
        inputProvTelefono.value = '';
        inputProvCalle.value = '';
        inputProvNumero.value = '';
        inputProvColonia.value = '';
        inputProvCP.value = '';

        
        await cargarProveedores();

    } catch (error) {
        console.error('Error al agregar proveedor:', error);
        alert('Error al agregar proveedor: ' + error.message);
    } finally {
        btnAgregarProveedor.disabled = false;
        btnAgregarProveedor.textContent = 'Agregar Proveedor';
    }
}


if (btnAgregarProveedor) {
    btnAgregarProveedor.addEventListener('click', agregarProveedor);
}



// Función para dibujar el carrito en el HTML
function actualizarVistaCarrito() {
    listaCarrito.innerHTML = ''; 
    let total = 0;

    if (carrito.length === 0) {
        listaCarrito.innerHTML = '<li class="list-group-item">Carrito vacío</li>';
        spanTotal.textContent = '0.00';
        return;
    }

    carrito.forEach(item => {
        const subtotal = item.precio_unitario * item.cantidad;
        total += subtotal;

        const li = document.createElement('li');
        li.className = 'list-group-item';
        li.innerHTML = `
            ${item.nombre} (${item.cantidad} x $${item.precio_unitario})
            <span class="float-end">$${subtotal.toFixed(2)}</span>
        `;
        listaCarrito.appendChild(li);
    });

    spanTotal.textContent = total.toFixed(2); 
}


function agregarAlCarrito() {
    const selectedOption = selectVentaProducto.options[selectVentaProducto.selectedIndex];

   
    if (!selectedOption.value) {
        alert('Por favor, selecciona un producto.');
        return;
    }

    const id_producto = parseInt(selectedOption.value);
    const nombre = selectedOption.dataset.nombre;
    const precio_unitario = parseFloat(selectedOption.dataset.precio);
    const cantidad = parseInt(inputVentaCantidad.value);


    carrito.push({ id_producto, nombre, precio_unitario, cantidad });

    actualizarVistaCarrito();

  
    selectVentaProducto.value = "";
    inputVentaCantidad.value = "1";
}

async function registrarVenta() {
    if (carrito.length === 0) {
        alert('El carrito está vacío. Añade productos antes de registrar la venta.');
        return;
    }

    const monto_total = carrito.reduce((total, item) => {
        return total + (item.precio_unitario * item.cantidad);
    }, 0);

    btnRegistrarVenta.disabled = true;
    btnRegistrarVenta.textContent = 'Registrando...';

    try {
        
        const respuesta = await fetch(`${API_URL}/api/ventas`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ carrito, monto_total }),
        });

        if (!respuesta.ok) {
            const errorData = await respuesta.json();
            throw new Error(errorData.error || 'Error del servidor');
        }

        
        alert('¡Venta registrada con éxito!');

        
        carrito = []; 
        actualizarVistaCarrito();

     
        await cargarProductos();

    } catch (error) {
        console.error('Error al registrar la venta:', error);
        alert('Error al registrar la venta: ' + error.message);
    } finally {
        btnRegistrarVenta.disabled = false;
        btnRegistrarVenta.textContent = 'Registrar Venta';
    }
}


if (btnAgregarCarrito) {
    btnAgregarCarrito.addEventListener('click', agregarAlCarrito);
}
if (btnRegistrarVenta) {
    btnRegistrarVenta.addEventListener('click', registrarVenta);
}


const btnLogin = document.getElementById('btn-login');


if (btnLogin) {
    btnLogin.addEventListener('click', async () => {
        
   
        const username = document.getElementById('username-input').value;
        const password = document.getElementById('password-input').value;
        const errorMensaje = document.getElementById('mensaje-error');

       
        btnLogin.disabled = true;
        btnLogin.textContent = 'Verificando...';
        if (errorMensaje) errorMensaje.classList.add('d-none');

        try {
           
            const response = await fetch(`${API_URL}/api/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Fallo en la autenticación.');
            }

         
            localStorage.setItem('jwt_token', data.token);
            localStorage.setItem('user_rol', data.user.rol);
            window.location.href = 'index.html';

        } catch (error) {
            
            if (errorMensaje) {
                errorMensaje.textContent = error.message;
                errorMensaje.classList.remove('d-none');
            } else {
                alert(error.message);
            }
        } finally {
           
            btnLogin.disabled = false;
            btnLogin.textContent = 'Iniciar Sesión';
        }
    });
}


document.addEventListener('DOMContentLoaded', () => {
    // Detectamos el rol guardado en el login
    const currentRol = isGitHubPages ? 'Administrador' : localStorage.getItem('user_rol');
    
    // Referencias a los botones de navegación
    const navs = {
        dashboard: document.getElementById('nav-dashboard'),
        gestion: document.getElementById('nav-gestion'),
        pos: document.getElementById('nav-pos')
    };
    
    const adminForms = document.querySelectorAll('.admin-form'); 
    const toggleForms = (show) => {
    // 1. Busca todos los elementos con la clase .admin-form (columnas o tarjetas)
    const adminForms = document.querySelectorAll('.admin-form'); 
    adminForms.forEach(form => form.style.display = show ? 'block' : 'none');

    // 2. Busca cualquier botón que sirva para agregar cosas
    const botonesAgregar = document.querySelectorAll('[id^="btn-agregar"]');
    botonesAgregar.forEach(btn => btn.style.display = show ? 'block' : 'none');
    };

    // --- LÓGICA DE ACCESO ---
    switch (currentRol) {
        case 'Administrador':
            navs.dashboard.style.display = 'block';
            navs.gestion.style.display = 'block';
            navs.pos.style.display = 'block';
            toggleForms(true);
            
            cargarTodoAdmin(); // Carga todas las gráficas y tablas
            mostrarSeccion('dashboard');
            break;

        case 'Inventario':
            navs.dashboard.style.display = 'block';
            navs.gestion.style.display = 'block';
            navs.pos.style.display = 'none'; // No puede vender
            toggleForms(true); // Puede agregar productos
            
            cargarCategorias();
            cargarProductos();
            cargarProveedores();
            cargarGraficaStock();
            mostrarSeccion('dashboard');
            break;

        case 'Lector':
            if(navs.dashboard) navs.dashboard.style.display = 'block';
            if(navs.gestion) navs.gestion.style.display = 'block';
            if(navs.pos) navs.pos.style.display = 'none';
    
            toggleForms(false); // Bloquea los formularios
    
            // CARGA DE DATOS (Asegúrate de incluir proveedores aquí)
            cargarCategorias();
            cargarProductos();
            cargarProveedores(); // <--- ESTA LÍNEA FALTABA
            cargarGraficaStock();
    
            mostrarSeccion('dashboard');
            break;

        case 'Cajero':
            navs.dashboard.style.display = 'none'; // No ve dinero ni gráficas
            navs.gestion.style.display = 'none';
            navs.pos.style.display = 'block';
            
            cargarProductos(); // Solo para el select de ventas
            mostrarSeccion('pos');
            break;

        default:
            console.error('Acceso no autorizado');
            window.location.href = 'login.html';
            break;
    }
});

// Función auxiliar para no repetir código en el Admin
function cargarTodoAdmin() {
    cargarCategorias();
    cargarProductos();
    cargarProveedores();
    cargarGraficaStock();
    cargarKPIsVentas();
    cargarGraficaVentas();
    cargarReportesTemporales();
}

const btnLogout = document.getElementById('btn-logout');
if (btnLogout) {
    btnLogout.addEventListener('click', () => {
        localStorage.removeItem('jwt_token');
        localStorage.removeItem('user_rol');
        window.location.href = 'login.html';
    });
}

// =========================================================
// FUNCIONES DE CONTROL Y REPORTES (VERSIÓN CONSOLIDADA)
// =========================================================

// 1. Función para navegar entre secciones (Modularización)
function mostrarSeccion(idSeccion) {
    // Ocultar las 3 secciones
    document.getElementById('sec-dashboard').style.display = 'none';
    document.getElementById('sec-gestion').style.display = 'none';
    document.getElementById('sec-pos').style.display = 'none';

    // Mostrar solo la elegida
    document.getElementById('sec-' + idSeccion).style.display = 'block';
    
    // Si regresas al tablero, refrescar gráficas
    if (idSeccion === 'dashboard') {
        cargarGraficaStock();
        cargarKPIsVentas();
        cargarGraficaVentas();
        cargarReportesTemporales();
    }
}

// 2. Gráfica de Inventario (Rojo/Azul)
async function cargarGraficaStock() {
    try {
        const respuesta = await fetch(`${API_URL}/api/reporte-stock`);
        const datos = await respuesta.json();
        const listaAvisos = document.getElementById('lista-avisos');
        if (listaAvisos) listaAvisos.innerHTML = ''; 

        const etiquetas = datos.map(item => item.nombre_producto);
        const valores = datos.map(item => item.stock);
        const colores = datos.map(item => {
            if (item.stock <= 10) {
                if (listaAvisos) {
                    const li = document.createElement('li');
                    li.className = 'list-group-item text-danger small font-weight-bold';
                    li.innerHTML = `⚠️ Pedir: ${item.nombre_producto} (${item.stock} restan)`;
                    listaAvisos.appendChild(li);
                }
                return 'rgba(231, 74, 59, 0.8)'; // Rojo
            }
            return 'rgba(78, 115, 223, 0.8)'; // Azul
        });

        const ctx = document.getElementById('graficaStock').getContext('2d');
        if (window.chartStock) window.chartStock.destroy();
        window.chartStock = new Chart(ctx, {
            type: 'bar',
            data: { labels: etiquetas, datasets: [{ label: 'Stock Actual', data: valores, backgroundColor: colores }] },
            options: { responsive: true, maintainAspectRatio: false }
        });
    } catch (e) { console.error("Error en Gráfica Stock:", e); }
}

// 3. KPIs de Ventas y Top 5
async function cargarKPIsVentas() {
    try {
        const res = await fetch(`${API_URL}/api/reporte-kpis`);
        const datos = await res.json();
        const fmt = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' });

        document.getElementById('kpi-total-dinero').textContent = fmt.format(datos.total_ingresos || 0);
        document.getElementById('kpi-total-ventas').textContent = datos.total_transacciones || 0;
    } catch (e) { console.error("Error en KPIs:", e); }
}

async function cargarGraficaVentas() {
    try {
        const res = await fetch(`${API_URL}/api/reporte-top-ventas`);
        const datos = await res.json();
        const ctx = document.getElementById('graficaVentas').getContext('2d');
        if (window.chartVentas) window.chartVentas.destroy();
        window.chartVentas = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: datos.map(i => i.nombre_producto),
                datasets: [{ label: 'Unidades Vendidas', data: datos.map(i => i.total_unidades_vendidas), backgroundColor: 'rgba(28, 200, 138, 0.7)' }]
            },
            options: { responsive: true, maintainAspectRatio: false }
        });
    } catch (e) { console.error("Error en Top Ventas:", e); }
}

// 4. Venta de Hoy y Tendencia Semanal
async function cargarReportesTemporales() {
    try {
        // Venta de Hoy
        const resH = await fetch(`${API_URL}/api/reporte-hoy`);
        const dH = await resH.json();
        const fmt = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' });
        document.getElementById('kpi-venta-hoy').textContent = fmt.format(dH.total_hoy || 0);

        // Gráfica Semanal (Líneas)
        const resS = await fetch(`${API_URL}/api/reporte-semanal`);
        const dS = await resS.json();
        const ctx = document.getElementById('graficaSemanal').getContext('2d');
        if (window.chartSemana) window.chartSemana.destroy();
        window.chartSemana = new Chart(ctx, {
            type: 'line',
            data: {
                labels: dS.map(d => d.dia),
                datasets: [{ label: 'Ventas ($)', data: dS.map(d => d.total_dia), borderColor: '#36b9cc', fill: true, tension: 0.3 }]
            },
            options: { responsive: true, maintainAspectRatio: false }
        });
    } catch (e) { console.error("Error en Reportes Temporales:", e); }
}