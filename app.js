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
    const listaExistente = document.getElementById('lista-categorias');

    if (listaExistente) {
        

        const currentRol = isGitHubPages ? 'Administrador' : localStorage.getItem('user_rol');
        const adminPanel = document.getElementById('admin-panel');
        const posSection = document.getElementById('pos-section');
        const adminForms = document.querySelectorAll('.admin-form'); 
        
        const toggleForms = (show) => {
            adminForms.forEach(form => form.style.display = show ? 'block' : 'none');
        };

        switch (currentRol) {
            
            case 'Administrador':
            
                if (adminPanel) adminPanel.style.display = 'block';
                if (posSection) posSection.style.display = 'block';
                toggleForms(true);
                cargarCategorias(); 
                cargarProductos();  
                cargarProveedores();
                break;

            case 'Cajero':
             
                if (adminPanel) adminPanel.style.display = 'none'; 
                if (posSection) posSection.style.display = 'block'; 
                
                cargarProductos(); 
                break;

            case 'Inventario':
              
                if (adminPanel) adminPanel.style.display = 'block';
                if (posSection) posSection.style.display = 'none'; 
                toggleForms(true); 

                cargarCategorias(); 
                cargarProductos();  
                cargarProveedores();
                break;

            case 'Lector':
    
                if (adminPanel) adminPanel.style.display = 'block'; 
                if (posSection) posSection.style.display = 'none';  
                toggleForms(false); 

                cargarCategorias(); 
                cargarProductos();  
                cargarProveedores();
                break;

            default:
                console.warn('Rol desconocido:', rolUsuario);
               
                if (adminPanel) adminPanel.style.display = 'none';
                if (posSection) posSection.style.display = 'none';
                break;
        }

        console.log('Usuario logueado con rol:', rolUsuario);
    }
});


const btnLogout = document.getElementById('btn-logout');
if (btnLogout) {
    btnLogout.addEventListener('click', () => {
        localStorage.removeItem('jwt_token');
        localStorage.removeItem('user_rol');
        window.location.href = 'login.html';
    });
}