
const formulario = document.getElementById('formulario');
const tabla = document.getElementById('tabla-productos');
const mensaje = document.getElementById('mensaje');

// Consultar productos
async function cargarProductos() {
    try {
        const respuesta = await fetch('/productos');
        const productos = await respuesta.json();

        tabla.innerHTML = '';

        productos.forEach(producto => {
            const fila = document.createElement('tr');

            [producto.id, producto.nombre, producto.categoria,
             producto.precio, producto.stock].forEach(valor => {
                const celda = document.createElement('td');
                celda.textContent = valor;
                fila.appendChild(celda);
            });

            tabla.appendChild(fila);
        });

    } catch (error) {
        mensaje.textContent = 'Error al consultar productos';
    }
}

// Registrar producto
formulario.addEventListener('submit', async (e) => {
    e.preventDefault();

    const producto = {
        nombre: document.getElementById('nombre').value.trim(),
        categoria: document.getElementById('categoria').value.trim(),
        precio: Number(document.getElementById('precio').value),
        stock: Number(document.getElementById('stock').value)
    };

    if (!producto.nombre || !producto.categoria ||
        !Number.isFinite(producto.precio) || producto.precio <= 0 ||
        !Number.isInteger(producto.stock) || producto.stock < 0) {

        mensaje.textContent = 'Verifica los datos ingresados';
        return;
    }

    try {
        const respuesta = await fetch('/productos', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(producto)
        });

        const resultado = await respuesta.json();

        if (!respuesta.ok) {
            throw new Error(resultado.mensaje);
        }

        mensaje.textContent = resultado.mensaje;

        formulario.reset();

        await cargarProductos();

    } catch (error) {
        mensaje.textContent = error.message;
    }
});

// Cargar al iniciar
cargarProductos();
