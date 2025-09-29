// Объект для работы с корзиной
const cart = {
    // Получить корзину из localStorage
    getCart: function() {
        return JSON.parse(localStorage.getItem('cart')) || [];
    },

    // Сохранить корзину в localStorage
    saveCart: function(cartItems) {
        localStorage.setItem('cart', JSON.stringify(cartItems));
    },

    // Добавить товар в корзину
    addToCart: function(productId, productName, productPrice, productImage) {
        let cartItems = this.getCart();
        let existingItem = cartItems.find(item => item.id === productId);

        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cartItems.push({
                id: productId,
                name: productName,
                price: productPrice,
                image: productImage,
                quantity: 1
            });
        }

        this.saveCart(cartItems);
        this.updateCartCount();
        this.showAddToCartMessage(productName);
    },

    // Удалить товар из корзины
    removeFromCart: function(productId) {
        let cartItems = this.getCart();
        cartItems = cartItems.filter(item => item.id !== productId);
        this.saveCart(cartItems);
        this.updateCartCount();
        
        // Если мы на странице корзины, обновляем отображение
        if (window.location.pathname.includes('basket.html')) {
            this.displayCartItems();
        }
    },

    // Изменить количество товара
    updateQuantity: function(productId, newQuantity) {
        if (newQuantity < 1) return;

        let cartItems = this.getCart();
        let item = cartItems.find(item => item.id === productId);
        
        if (item) {
            item.quantity = newQuantity;
            this.saveCart(cartItems);
            this.updateCartCount();
            
            if (window.location.pathname.includes('basket.html')) {
                this.displayCartItems();
            }
        }
    },

    // Посчитать общую сумму
    calculateTotal: function() {
        let cartItems = this.getCart();
        return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
    },

    // Обновить счетчик товаров в корзине
    updateCartCount: function() {
        let cartItems = this.getCart();
        let totalCount = cartItems.reduce((count, item) => count + item.quantity, 0);
        
        // Обновляем все элементы с id cart-count на странице
        document.querySelectorAll('#cart-count').forEach(element => {
            element.textContent = totalCount;
        });
    },

    // Показать сообщение о добавлении в корзину
    showAddToCartMessage: function(productName) {
        alert(`Товар "${productName}" добавлен в корзину!`);
    },

    // Очистить корзину
    clearCart: function() {
        localStorage.removeItem('cart');
        this.updateCartCount();
        
        if (window.location.pathname.includes('basket.html')) {
            this.displayCartItems();
        }
    }
};

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    // Обновляем счетчик корзины
    cart.updateCartCount();

    // Добавляем обработчики для кнопок "Добавить в корзину"
    document.querySelectorAll('.add-to-cart').forEach(button => {
        button.addEventListener('click', function() {
            const productCard = this.closest('.product-card');
            const productId = productCard.dataset.id;
            const productName = productCard.querySelector('h3').textContent;
            const productPrice = parseInt(productCard.dataset.price);
            const productImage = productCard.querySelector('img').src;

            cart.addToCart(productId, productName, productPrice, productImage);
        });
    });
});

