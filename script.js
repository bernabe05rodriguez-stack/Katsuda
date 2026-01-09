document.addEventListener('DOMContentLoaded', () => {
    const productGrid = document.getElementById('product-grid');
    const categoryFilter = document.getElementById('category-filter');
    const cartCount = document.getElementById('cart-count');
    const cartItemsContainer = document.getElementById('cart-items');
    const cartTotalElement = document.getElementById('cart-total');

    let products = [];
    let cart = JSON.parse(localStorage.getItem('cart')) || [];

    // Fetch products
    fetch('products.json')
        .then(response => response.json())
        .then(data => {
            products = data;
            renderProducts(products);
        })
        .catch(error => {
            console.error('Error fetching products:', error);
            productGrid.innerHTML = '<div class="col-12 text-center text-danger">Error al cargar productos.</div>';
        });

    // Render products function
    function renderProducts(productsToRender) {
        productGrid.innerHTML = '';
        if (productsToRender.length === 0) {
            productGrid.innerHTML = '<div class="col-12 text-center">No se encontraron productos.</div>';
            return;
        }

        productsToRender.forEach(product => {
            const productCard = document.createElement('div');
            productCard.className = 'col-md-4 col-lg-3';
            productCard.innerHTML = `
                <div class="card h-100 product-card">
                    <img src="${product.image}" class="card-img-top" alt="${product.name}">
                    <div class="card-body d-flex flex-column">
                        <h5 class="card-title">${product.name}</h5>
                        <p class="card-text text-muted">${product.category}</p>
                        <p class="card-text flex-grow-1">${product.description}</p>
                        <div class="mt-auto">
                            <h4 class="fw-bold mb-3">$${product.price.toLocaleString('es-AR')}</h4>
                            <button class="btn btn-primary w-100" onclick="addToCart(${product.id})">
                                <i class="fa-solid fa-cart-plus me-2"></i>Agregar
                            </button>
                        </div>
                    </div>
                </div>
            `;
            productGrid.appendChild(productCard);
        });
    }

    // Filter functionality
    categoryFilter.addEventListener('change', (e) => {
        const selectedCategory = e.target.value;
        if (selectedCategory === 'all') {
            renderProducts(products);
        } else {
            const filteredProducts = products.filter(p => p.category === selectedCategory);
            renderProducts(filteredProducts);
        }
    });

    // Add to cart functionality
    window.addToCart = (productId) => {
        const product = products.find(p => p.id === productId);
        if (product) {
            const existingItem = cart.find(item => item.id === productId);
            if (existingItem) {
                existingItem.quantity += 1;
            } else {
                cart.push({ ...product, quantity: 1 });
            }
            updateCart();

            // Show feedback (could be a toast, but using alert for simplicity or nothing)
            // alert(`${product.name} agregado al carrito!`);

            // Open offcanvas automatically (optional)
             const offcanvasElement = document.getElementById('cartOffcanvas');
             const bsOffcanvas = new bootstrap.Offcanvas(offcanvasElement);
             bsOffcanvas.show();
        }
    };

    // Update cart UI
    function updateCart() {
        localStorage.setItem('cart', JSON.stringify(cart));

        // Update count
        const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);
        cartCount.textContent = totalItems;

        // Update items list
        cartItemsContainer.innerHTML = '';
        if (cart.length === 0) {
            cartItemsContainer.innerHTML = '<p class="text-center text-muted">El carrito está vacío.</p>';
        } else {
            cart.forEach(item => {
                const itemElement = document.createElement('div');
                itemElement.className = 'd-flex justify-content-between align-items-center mb-3 border-bottom pb-2';
                itemElement.innerHTML = `
                    <div>
                        <h6 class="mb-0">${item.name}</h6>
                        <small class="text-muted">$${item.price.toLocaleString('es-AR')} x ${item.quantity}</small>
                    </div>
                    <div class="d-flex align-items-center">
                         <span class="fw-bold me-3">$${(item.price * item.quantity).toLocaleString('es-AR')}</span>
                         <button class="btn btn-sm btn-outline-danger" onclick="removeFromCart(${item.id})">
                            <i class="fa-solid fa-trash"></i>
                         </button>
                    </div>
                `;
                cartItemsContainer.appendChild(itemElement);
            });
        }

        // Update total
        const total = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
        cartTotalElement.textContent = `$${total.toLocaleString('es-AR')}`;
    }

    // Remove from cart
    window.removeFromCart = (productId) => {
        cart = cart.filter(item => item.id !== productId);
        updateCart();
    };

    // Initialize cart
    updateCart();
});
