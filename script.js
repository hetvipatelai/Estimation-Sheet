// Data Storage
let products = [];
let customerData = {
    name: '',
    phone: ''
};

// Page Navigation
function goToPage1() {
    showPage('page1');
}

function goToPage2() {
    const name = document.getElementById('customerName').value.trim();
    const phone = document.getElementById('customerPhone').value.trim();
    
    if (!name || !phone) {
        alert('Please fill in all fields');
        return;
    }
    
    customerData.name = name;
    customerData.phone = phone;
    
    showPage('page2');
    renderProductsTable();
}

function goToPage3() {
    if (products.length === 0) {
        alert('Please add at least one product');
        return;
    }
    
    populatePDFContent();
    showPage('page3');
}

function showPage(pageId) {
    // Hide all pages
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    
    // Show selected page
    document.getElementById(pageId).classList.add('active');
}

// Modal Functions
function openProductModal() {
    document.getElementById('productModal').classList.add('active');
    document.getElementById('productForm').reset();
}

function closeProductModal() {
    document.getElementById('productModal').classList.remove('active');
    document.getElementById('productForm').reset();
}

// Product Management
function addProduct() {
    const category = document.getElementById('productCategory').value;
    const title = document.getElementById('productTitle').value.trim();
    const length = parseFloat(document.getElementById('productLength').value);
    const width = parseFloat(document.getElementById('productWidth').value);
    const pricePerSqft = parseFloat(document.getElementById('productPricePerSqft').value);
    
    if (!category || !length || !width || !pricePerSqft) {
        alert('Please fill in all required fields');
        return;
    }
    
    const sqft = calculateSqft(length, width);
    const totalPrice = calculateTotalPrice(sqft, pricePerSqft);
    
    const product = {
        id: Date.now(),
        category,
        title,
        length,
        width,
        sqft,
        pricePerSqft,
        totalPrice
    };
    
    products.push(product);
    renderProductsTable();
    closeProductModal();
}

function deleteProduct(productId) {
    if (confirm('Are you sure you want to delete this product?')) {
        products = products.filter(p => p.id !== productId);
        renderProductsTable();
    }
}

function clearAllProducts() {
    if (products.length === 0) {
        alert('No products to clear');
        return;
    }
    
    if (confirm('Are you sure you want to clear all products? This cannot be undone.')) {
        products = [];
        renderProductsTable();
    }
}

// Calculations
function calculateSqft(length, width) {
    // Convert from inches to feet then calculate sqft
    const lengthFt = length / 12;
    const widthFt = width / 12;
    return (lengthFt * widthFt).toFixed(2);
}

function calculateTotalPrice(sqft, pricePerSqft) {
    return (parseFloat(sqft) * parseFloat(pricePerSqft)).toFixed(2);
}

function calculateGrandTotal() {
    return products.reduce((sum, product) => sum + parseFloat(product.totalPrice), 0).toFixed(2);
}

// Render Functions
function renderProductsTable() {
    const tbody = document.getElementById('productsTableBody');
    
    if (products.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="empty-state">No products added yet</td></tr>';
        document.getElementById('totalPrice').textContent = '₹0';
        return;
    }
    
    tbody.innerHTML = products.map(product => `
        <tr>
            <td>${product.category}</td>
            <td>${product.title}</td>
            <td>${product.length}" × ${product.width}"</td>
            <td>${product.sqft} sqft</td>
            <td>₹${product.pricePerSqft.toFixed(2)}</td>
            <td>₹${product.totalPrice}</td>
            <td>
                <button type="button" class="btn btn-delete" onclick="deleteProduct(${product.id})">Delete</button>
            </td>
        </tr>
    `).join('');
    
    const total = calculateGrandTotal();
    document.getElementById('totalPrice').textContent = `₹${parseFloat(total).toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
}

function populatePDFContent() {
    document.getElementById('pdfClientName').textContent = customerData.name;
    document.getElementById('pdfClientPhone').textContent = customerData.phone;
    
    const today = new Date();
    const dateStr = today.toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    document.getElementById('pdfDate').textContent = dateStr;
    
    const pdfTableBody = document.getElementById('pdfProductsTableBody');
    pdfTableBody.innerHTML = products.map(product => `
        <tr>
            <td>${product.category}</td>
            <td>${product.title}</td>
            <td>${product.length}" × ${product.width}"</td>
            <td>${product.sqft}</td>
            <td>₹${product.pricePerSqft.toFixed(2)}</td>
            <td>₹${product.totalPrice}</td>
        </tr>
    `).join('');
    
    const total = calculateGrandTotal();
    document.getElementById('pdfTotalPrice').textContent = `₹${parseFloat(total).toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
}

// PDF Download
function downloadPDF() {
    const element = document.getElementById('pdfContent');
    const fileName = `Estimation_${customerData.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
    
    const opt = {
        margin: 10,
        filename: fileName,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { orientation: 'portrait', unit: 'mm', format: 'a4' }
    };
    
    // Create a clone to modify styles for PDF
    const cloneElement = element.cloneNode(true);
    cloneElement.style.margin = '0';
    cloneElement.style.padding = '0';
    
    html2pdf().set(opt).from(cloneElement).save();
}

// Event Listeners
document.getElementById('productLength')?.addEventListener('input', updateProductSqft);
document.getElementById('productWidth')?.addEventListener('input', updateProductSqft);
document.getElementById('productPricePerSqft')?.addEventListener('input', updateProductTotalPrice);

function updateProductSqft() {
    const length = parseFloat(document.getElementById('productLength').value) || 0;
    const width = parseFloat(document.getElementById('productWidth').value) || 0;
    
    if (length > 0 && width > 0) {
        const sqft = calculateSqft(length, width);
        document.getElementById('productSqft').value = `${sqft} sqft`;
        updateProductTotalPrice();
    } else {
        document.getElementById('productSqft').value = '';
        document.getElementById('productTotalPrice').value = '';
    }
}

function updateProductTotalPrice() {
    const sqftText = document.getElementById('productSqft').value;
    const sqft = parseFloat(sqftText);
    const pricePerSqft = parseFloat(document.getElementById('productPricePerSqft').value) || 0;
    
    if (sqft > 0 && pricePerSqft > 0) {
        const totalPrice = calculateTotalPrice(sqft, pricePerSqft);
        document.getElementById('productTotalPrice').value = `₹${totalPrice}`;
    } else {
        document.getElementById('productTotalPrice').value = '';
    }
}

// Close modal when clicking outside
document.getElementById('productModal')?.addEventListener('click', function(e) {
    if (e.target === this) {
        closeProductModal();
    }
});

// Initialize - Show first page
window.addEventListener('load', function() {
    goToPage1();
});

// Prevent zoom on input focus (mobile)
document.addEventListener('touchmove', function(e) {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') {
        e.preventDefault();
    }
}, { passive: false });
