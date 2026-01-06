
// ----- CONFIGURACIÓN -----
// 1. Pon la URL de tu API desplegada en Render
const API_URL = 'https://mitienda-ibgx.onrender.com'; 

const token = localStorage.getItem('jwt_token');
const rolUsuario = localStorage.getItem('user_rol');

// REDIRECCIONAMIENTO: Si no hay token, ve al login
if (!token && window.location.pathname !== '/login.html') {
    window.location.href = 'login.html';
} else if (token && window.location.pathname === '/login.html') {
    window.location.href = 'index.html'; // Si ya estás logueado, ve al inicio
}

// 2. Seleccionar elementos del HTML
const listaCategorias = document.getElementById('lista-categorias');

// --- AÑADE ESTAS 3 LÍNEAS ---
const btnAgregar = document.getElementById('btn-agregar');
const inputNombre = document.getElementById('nombre-categoria');
const inputDesc = document.getElementById('desc-categoria');
// ----------------------------
// ----- NUEVOS ELEMENTOS DE PRODUCTOS -----
const listaProductos = document.getElementById('lista-productos');
const btnAgregarProducto = document.getElementById('btn-agregar-producto');
const inputProductoNombre = document.getElementById('producto-nombre');
const inputProductoMarca = document.getElementById('producto-marca');
const selectProductoCategoria = document.getElementById('producto-categoria');
const inputProductoPrecio = document.getElementById('producto-precio');
const inputProductoStock = document.getElementById('producto-stock');
// ----- NUEVOS ELEMENTOS DE PROVEEDORES -----
const listaProveedores = document.getElementById('lista-proveedores');
const btnAgregarProveedor = document.getElementById('btn-agregar-proveedor');
const inputProvNombre = document.getElementById('prov-nombre');
const inputProvTelefono = document.getElementById('prov-telefono');
const inputProvCalle = document.getElementById('prov-calle');
const inputProvNumero = document.getElementById('prov-numero');
const inputProvColonia = document.getElementById('prov-colonia');
const inputProvCP = document.getElementById('prov-cp');

// ----- VARIABLE GLOBAL DEL CARRITO -----
let carrito = [];

// ----- NUEVOS ELEMENTOS DEL PUNTO DE VENTA -----
const selectVentaProducto = document.getElementById('venta-producto');
const inputVentaCantidad = document.getElementById('venta-cantidad');
const btnAgregarCarrito = document.getElementById('btn-agregar-carrito');
const listaCarrito = document.getElementById('lista-carrito');
const spanTotal = document.getElementById('carrito-total');
const btnRegistrarVenta = document.getElementById('btn-registrar-venta');

// ----- FUNCIÓN PARA OBTENER Y MOSTRAR CATEGORÍAS -----
async function cargarCategorias() {
    try {
        const respuesta = await fetch(`${API_URL}/api/categorias`);
        const categorias = await respuesta.json();

        // Limpiar ambos elementos
        listaCategorias.innerHTML = '';
        selectProductoCategoria.innerHTML = ''; // Limpiar el dropdown

        // Llenar el dropdown de productos
        const opcionDefecto = document.createElement('option');
        opcionDefecto.value = "";
        opcionDefecto.textContent = "Selecciona una categoría";
        selectProductoCategoria.appendChild(opcionDefecto);

        if (categorias.length === 0) {
            listaCategorias.innerHTML = '<li class="list-group-item">No hay categorías registradas.</li>';
        }

       categorias.forEach(categoria => {
            // 1. Llenar la lista de la izquierda
            const li = document.createElement('li');
            li.className = 'list-group-item';
            li.textContent = categoria.nombre_categoria;
            listaCategorias.appendChild(li);

            // 2. Llenar el menú desplegable (select)
            const opcion = document.createElement('option');
            opcion.value = categoria.id_categoria; // Guardamos el ID
            opcion.textContent = categoria.nombre_categoria; // Mostramos el Nombre
            selectProductoCategoria.appendChild(opcion);
        });

    } catch (error) {
        console.error('Error al cargar categorías:', error);
        listaCategorias.innerHTML = `<li class="list-group-item text-danger">Error al cargar datos. Revisa la consola.</li>`;
    }
}

// ----- EJECUTAR LA FUNCIÓN AL CARGAR LA PÁGINA -----
// 'DOMContentLoaded' espera a que todo el HTML esté listo
document.addEventListener('DOMContentLoaded', () => {
    cargarCategorias();
});

// ----- FUNCIÓN PARA AGREGAR UNA NUEVA CATEGORÍA -----
async function agregarCategoria(event) {
  // 1. Evitar que el formulario recargue la página
  event.preventDefault();

  // 2. Obtener los valores de los inputs
  const nombre = inputNombre.value;
  const descripcion = inputDesc.value;

  // 3. Validar que el nombre no esté vacío
  if (!nombre) {
    alert('Por favor, escribe un nombre para la categoría.');
    return;
  }

  // 4. Deshabilitar el botón para evitar doble clic
  btnAgregar.disabled = true;
  btnAgregar.textContent = 'Agregando...';

  try {
    // 5. Enviar los datos al Backend (API) usando fetch con POST
    const respuesta = await fetch(`${API_URL}/api/categorias`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json', // Avisar que enviaremos JSON
      },
      body: JSON.stringify({ nombre, descripcion }), // Convertir datos a string JSON
    });

    if (!respuesta.ok) {
      // Si el backend mandó un error (ej. 400 o 500)
      const errorData = await respuesta.json();
      throw new Error(errorData.error || 'Error del servidor');
    }

    // 6. Si todo salió bien, limpiar los campos
    inputNombre.value = '';
    inputDesc.value = '';

    // 7. Recargar la lista de categorías (¡para ver la nueva!)
    await cargarCategorias();

  } catch (error) {
    console.error('Error al agregar categoría:', error);
    alert('Error al agregar categoría: ' + error.message);
  } finally {
    // 8. Volver a habilitar el botón, haya o no error
    btnAgregar.disabled = false;
    btnAgregar.textContent = 'Agregar Categoría';
  }
}

// ----- ASIGNAR LA FUNCIÓN AL BOTÓN -----
// Cuando el botón 'btn-agregar' reciba un clic, ejecuta la función agregarCategoria
if (btnAgregar) {
    btnAgregar.addEventListener('click', agregarCategoria);
}

// ----- FUNCIÓN PARA OBTENER Y MOSTRAR PRODUCTOS -----
async function cargarProductos() {
    try {
        const respuesta = await fetch(`${API_URL}/api/productos`);
        const productos = await respuesta.json();

        listaProductos.innerHTML = '';
        selectVentaProducto.innerHTML = ''; // Limpiar dropdown de ventas

        // Llenar dropdown de ventas
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

            // Usamos <span> para formatear
            li.innerHTML = `
                <div>
                    <span class="fw-bold">${producto.nombre_producto}</span>
                    <small class="text-muted d-block">${producto.marca} - ${producto.nombre_categoria}</small>
                </div>
                <span class="badge bg-primary rounded-pill">Stock: ${producto.stock}</span>
            `;
            listaProductos.appendChild(li);

            // 2. Llenar el dropdown de VENTAS (si hay stock)
            if (producto.stock > 0) {
                const opcion = document.createElement('option');
                opcion.value = producto.id_producto;
                // Guardamos datos clave en el 'dataset' del elemento
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

// ----- FUNCIÓN PARA AGREGAR UN NUEVO PRODUCTO -----
async function agregarProducto(event) {
    event.preventDefault();

    // Obtener valores, convirtiendo a número los necesarios
    const nombre = inputProductoNombre.value;
    const marca = inputProductoMarca.value;
    const precio = parseFloat(inputProductoPrecio.value);
    const stock = parseInt(inputProductoStock.value);
    const categoria_id = parseInt(selectProductoCategoria.value); // El ID de la categoría seleccionada

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

        // Limpiar formulario
        inputProductoNombre.value = '';
        inputProductoMarca.value = '';
        inputProductoPrecio.value = '';
        inputProductoStock.value = '';
        selectProductoCategoria.value = ''; // Resetear el dropdown

        // Recargar la lista de productos
        await cargarProductos();

    } catch (error) {
        console.error('Error al agregar producto:', error);
        alert('Error al agregar producto: ' + error.message);
    } finally {
        btnAgregarProducto.disabled = false;
        btnAgregarProducto.textContent = 'Agregar Producto';
    }
}

// ----- ASIGNAR LA FUNCIÓN AL NUEVO BOTÓN -----
if (btnAgregarProducto) {
    btnAgregarProducto.addEventListener('click', agregarProducto);
}
// ----- FUNCIÓN PARA OBTENER Y MOSTRAR PROVEEDORES -----
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

            // Construir la dirección completa (solo si existen los datos)
            let direccion = [prov.calle, prov.numero, prov.colonia, prov.codigo_postal]
                              .filter(Boolean) // Elimina nulos o vacíos
                              .join(', '); // Une con comas

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

// ----- FUNCIÓN PARA AGREGAR UN NUEVO PROVEEDOR -----
async function agregarProveedor(event) {
    event.preventDefault();

    // 1. Recolectar todos los datos del formulario
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

        // 2. Limpiar formulario
        inputProvNombre.value = '';
        inputProvTelefono.value = '';
        inputProvCalle.value = '';
        inputProvNumero.value = '';
        inputProvColonia.value = '';
        inputProvCP.value = '';

        // 3. Recargar la lista de proveedores
        await cargarProveedores();

    } catch (error) {
        console.error('Error al agregar proveedor:', error);
        alert('Error al agregar proveedor: ' + error.message);
    } finally {
        btnAgregarProveedor.disabled = false;
        btnAgregarProveedor.textContent = 'Agregar Proveedor';
    }
}

// ----- ASIGNAR LA FUNCIÓN AL NUEVO BOTÓN -----
if (btnAgregarProveedor) {
    btnAgregarProveedor.addEventListener('click', agregarProveedor);
}

// ----- FUNCIÓN 3: LÓGICA DEL CARRITO -----

// Función para dibujar el carrito en el HTML
function actualizarVistaCarrito() {
    listaCarrito.innerHTML = ''; // Limpiar la lista
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

    spanTotal.textContent = total.toFixed(2); // Poner el total con 2 decimales
}

// Función para el botón "Añadir al Carrito"
function agregarAlCarrito() {
    const selectedOption = selectVentaProducto.options[selectVentaProducto.selectedIndex];

    // 1. Validar que se seleccionó un producto
    if (!selectedOption.value) {
        alert('Por favor, selecciona un producto.');
        return;
    }

    // 2. Obtener los datos del producto desde el dropdown
    const id_producto = parseInt(selectedOption.value);
    const nombre = selectedOption.dataset.nombre;
    const precio_unitario = parseFloat(selectedOption.dataset.precio);
    const cantidad = parseInt(inputVentaCantidad.value);

    // 3. (Opcional: verificar si el producto ya está en el carrito y sumarlo)
    // Por ahora, solo lo agregamos
    carrito.push({ id_producto, nombre, precio_unitario, cantidad });

    // 4. Actualizar la vista
    actualizarVistaCarrito();

    // 5. Resetear los campos
    selectVentaProducto.value = "";
    inputVentaCantidad.value = "1";
}

// Función para el botón "Registrar Venta"
async function registrarVenta() {
    if (carrito.length === 0) {
        alert('El carrito está vacío. Añade productos antes de registrar la venta.');
        return;
    }

    // 1. Calcular el total
    const monto_total = carrito.reduce((total, item) => {
        return total + (item.precio_unitario * item.cantidad);
    }, 0);

    btnRegistrarVenta.disabled = true;
    btnRegistrarVenta.textContent = 'Registrando...';

    try {
        // 2. Enviar el carrito y el total al backend
        const respuesta = await fetch(`${API_URL}/api/ventas`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ carrito, monto_total }),
        });

        if (!respuesta.ok) {
            const errorData = await respuesta.json();
            throw new Error(errorData.error || 'Error del servidor');
        }

        // 3. Si todo salió bien
        alert('¡Venta registrada con éxito!');

        // 4. Limpiar el estado
        carrito = []; // Vaciar el carrito
        actualizarVistaCarrito(); // Actualizar la vista (mostrará "carrito vacío")

        // 5. Recargar productos (¡para ver el nuevo stock!)
        await cargarProductos();

    } catch (error) {
        console.error('Error al registrar la venta:', error);
        alert('Error al registrar la venta: ' + error.message);
    } finally {
        btnRegistrarVenta.disabled = false;
        btnRegistrarVenta.textContent = 'Registrar Venta';
    }
}

// ----- ASIGNAR LAS FUNCIONES A LOS NUEVOS BOTONES -----
if (btnAgregarCarrito) {
    btnAgregarCarrito.addEventListener('click', agregarAlCarrito);
}
if (btnRegistrarVenta) {
    btnRegistrarVenta.addEventListener('click', registrarVenta);
}

// ----- LÓGICA DE LOGIN (solo se ejecuta en login.html) -----
const btnLogin = document.getElementById('btn-login');

// Usamos 'click' en lugar de 'submit' porque quitamos el form del HTML
if (btnLogin) {
    btnLogin.addEventListener('click', async () => {
        
        // 1. Obtener valores de los inputs
        const username = document.getElementById('username-input').value;
        const password = document.getElementById('password-input').value;
        const errorMensaje = document.getElementById('mensaje-error');

        // 2. Feedback visual (deshabilitar botón mientras carga)
        btnLogin.disabled = true;
        btnLogin.textContent = 'Verificando...';
        if (errorMensaje) errorMensaje.classList.add('d-none');

        try {
            // 3. Llamar a la API
            const response = await fetch(`${API_URL}/api/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Fallo en la autenticación.');
            }

            // 4. Éxito: Guardar token y redirigir
            localStorage.setItem('jwt_token', data.token);
            localStorage.setItem('user_rol', data.user.rol);
            window.location.href = 'index.html';

        } catch (error) {
            // 5. Error: Mostrar mensaje en el cuadro de alerta
            if (errorMensaje) {
                errorMensaje.textContent = error.message;
                errorMensaje.classList.remove('d-none');
            } else {
                alert(error.message);
            }
        } finally {
            // 6. Restaurar botón
            btnLogin.disabled = false;
            btnLogin.textContent = 'Iniciar Sesión';
        }
    });
}

// ----- MODIFICAR EL 'DOMContentLoaded' -----
document.addEventListener('DOMContentLoaded', () => {
    const listaExistente = document.getElementById('lista-categorias');
    
    // Solo ejecutar si estamos en el Dashboard (index.html)
    if (listaExistente) {
        
        // 1. Obtener elementos clave
        const rolUsuario = localStorage.getItem('user_rol');
        const adminPanel = document.getElementById('admin-panel');
        const posSection = document.getElementById('pos-section'); // La sección de ventas
        const adminForms = document.querySelectorAll('.admin-form'); // Los formularios de agregar (con la clase que añadiste)
        
        // Función auxiliar para mostrar/ocultar solo los formularios de agregar
        const toggleForms = (show) => {
            adminForms.forEach(form => form.style.display = show ? 'block' : 'none');
        };

        // 2. Lógica de Permisos (Switch por Rol)
        switch (rolUsuario) {
            
            case 'Administrador':
                // VE TODO
                if (adminPanel) adminPanel.style.display = 'block';
                if (posSection) posSection.style.display = 'block';
                toggleForms(true); // Muestra formularios
                
                cargarCategorias(); 
                cargarProductos();  
                cargarProveedores();
                break;

            case 'Cajero':
                // SOLO VE PUNTO DE VENTA
                if (adminPanel) adminPanel.style.display = 'none'; // Oculta listas
                if (posSection) posSection.style.display = 'block'; // Muestra ventas
                
                cargarProductos(); // Solo carga productos para el dropdown
                break;

            case 'Inventario':
                // VE PANEL ADMIN (FORMULARIOS), PERO NO PUNTO DE VENTA
                if (adminPanel) adminPanel.style.display = 'block';
                if (posSection) posSection.style.display = 'none'; // Oculta ventas
                toggleForms(true); // Muestra formularios para agregar cosas

                cargarCategorias(); 
                cargarProductos();  
                cargarProveedores();
                break;

            case 'Lector':
                // VE LISTAS, PERO NI FORMULARIOS NI VENTAS
                if (adminPanel) adminPanel.style.display = 'block'; // Muestra el panel general
                if (posSection) posSection.style.display = 'none';  // Oculta ventas
                toggleForms(false); // ¡OCULTA LOS FORMULARIOS! (Aquí está la magia)

                cargarCategorias(); 
                cargarProductos();  
                cargarProveedores();
                break;

            default:
                console.warn('Rol desconocido:', rolUsuario);
                // Por seguridad, ocultamos todo si el rol es raro
                if (adminPanel) adminPanel.style.display = 'none';
                if (posSection) posSection.style.display = 'none';
                break;
        }

        console.log('Usuario logueado con rol:', rolUsuario);
    }
});

// (Mantén tu código del botón Logout que ya tenías al final, ese está bien)
const btnLogout = document.getElementById('btn-logout');
if (btnLogout) {
    btnLogout.addEventListener('click', () => {
        localStorage.removeItem('jwt_token');
        localStorage.removeItem('user_rol');
        window.location.href = 'login.html';
    });
}