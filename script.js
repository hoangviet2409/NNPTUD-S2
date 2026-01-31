// Biến toàn cục để lưu trữ tất cả sản phẩm
let allProducts = [];
let filteredProducts = [];
let currentPage = 1;
let itemsPerPage = 10;
let currentSort = { field: null, direction: null };

// Hàm getAll để lấy toàn bộ sản phẩm
async function getAll() {
    const loadingEl = document.getElementById('loading');
    const errorEl = document.getElementById('error');
    const tableContainer = document.getElementById('tableContainer');
    const searchContainer = document.getElementById('searchContainer');
    const tableBody = document.getElementById('productTableBody');

    try {
        loadingEl.style.display = 'block';
        errorEl.style.display = 'none';
        tableContainer.style.display = 'none';
        searchContainer.style.display = 'none';

        // Gọi API để lấy dữ liệu
        const response = await fetch('https://api.escuelajs.co/api/v1/products');

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const products = await response.json();

        // Lưu vào biến toàn cục
        allProducts = products;
        filteredProducts = products;
        currentPage = 1;

        // Render dữ liệu với phân trang
        renderPage();

        // Hiển thị bảng, search box, sorting và pagination
        loadingEl.style.display = 'none';
        tableContainer.style.display = 'block';
        searchContainer.style.display = 'block';
        document.getElementById('sortingControls').style.display = 'flex';
        document.getElementById('paginationControls').style.display = 'flex';
        document.getElementById('paginationNav').style.display = 'flex';
        updateSearchInfo(products.length, products.length);

    } catch (error) {
        console.error('Lỗi khi tải dữ liệu:', error);
        loadingEl.style.display = 'none';
        errorEl.textContent = `Lỗi: ${error.message}. Vui lòng thử lại sau.`;
        errorEl.style.display = 'block';
    }
}

// Hàm render trang hiện tại
function renderPage() {
    const tableBody = document.getElementById('productTableBody');

    // Tính toán sản phẩm cho trang hiện tại
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const pageProducts = filteredProducts.slice(startIndex, endIndex);

    // Xóa dữ liệu cũ
    tableBody.innerHTML = '';

    // Render dữ liệu vào bảng
    pageProducts.forEach(product => {
        const row = document.createElement('tr');

        // Format giá tiền
        const formattedPrice = new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'USD'
        }).format(product.price);

        // Format ngày tạo
        const createdDate = new Date(product.creationAt).toLocaleDateString('vi-VN');

        // Tạo HTML cho hình ảnh
        const imagesHTML = product.images.map(img =>
            `<img src="${img}" alt="${product.title}" class="product-image" onclick="openModal('${img}')">`
        ).join('');

        row.innerHTML = `
            <td>${product.id}</td>
            <td><strong>${product.title}</strong></td>
            <td class="price">${formattedPrice}</td>
            <td><span class="category-badge">${product.category.name}</span></td>
            <td><div class="description">${product.description}</div></td>
            <td><div class="product-images">${imagesHTML}</div></td>
            <td>${createdDate}</td>
        `;

        tableBody.appendChild(row);
    });

    // Cập nhật pagination controls
    updatePaginationControls();
}

// Hàm cập nhật pagination controls
function updatePaginationControls() {
    const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
    const startItem = (currentPage - 1) * itemsPerPage + 1;
    const endItem = Math.min(currentPage * itemsPerPage, filteredProducts.length);

    // Cập nhật page info
    const pageInfo = document.getElementById('pageInfo');
    pageInfo.textContent = `Trang ${currentPage} / ${totalPages} (${startItem}-${endItem} của ${filteredProducts.length})`;

    // Cập nhật nút prev/next
    document.getElementById('prevBtn').disabled = currentPage === 1;
    document.getElementById('nextBtn').disabled = currentPage === totalPages;

    // Render page numbers
    renderPageNumbers(totalPages);
}

// Hàm render số trang
function renderPageNumbers(totalPages) {
    const pageNumbers = document.getElementById('pageNumbers');
    pageNumbers.innerHTML = '';

    // Hiển thị tối đa 5 số trang
    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, startPage + 4);

    if (endPage - startPage < 4) {
        startPage = Math.max(1, endPage - 4);
    }

    for (let i = startPage; i <= endPage; i++) {
        const pageBtn = document.createElement('span');
        pageBtn.className = 'page-number' + (i === currentPage ? ' active' : '');
        pageBtn.textContent = i;
        pageBtn.onclick = () => goToPage(i);
        pageNumbers.appendChild(pageBtn);
    }
}

// Hàm chuyển trang
function goToPage(page) {
    currentPage = page;
    renderPage();
}

// Hàm trang trước
function previousPage() {
    if (currentPage > 1) {
        currentPage--;
        renderPage();
    }
}

// Hàm trang sau
function nextPage() {
    const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
    if (currentPage < totalPages) {
        currentPage++;
        renderPage();
    }
}

// Hàm thay đổi số items per page
function changeItemsPerPage() {
    itemsPerPage = parseInt(document.getElementById('itemsPerPage').value);
    currentPage = 1;
    renderPage();
}

// Hàm lọc sản phẩm theo title
function filterProducts() {
    const searchInput = document.getElementById('searchInput');
    const searchTerm = searchInput.value.toLowerCase().trim();

    // Lọc sản phẩm theo title
    filteredProducts = allProducts.filter(product =>
        product.title.toLowerCase().includes(searchTerm)
    );

    // Reset về trang 1
    currentPage = 1;

    // Render lại với phân trang
    renderPage();

    // Cập nhật thông tin tìm kiếm
    updateSearchInfo(filteredProducts.length, allProducts.length);
}

// Hàm cập nhật thông tin tìm kiếm
function updateSearchInfo(filtered, total) {
    const searchInfo = document.getElementById('searchInfo');
    if (filtered === total) {
        searchInfo.textContent = `Hiển thị tất cả ${total} sản phẩm`;
    } else {
        searchInfo.textContent = `Tìm thấy ${filtered} / ${total} sản phẩm`;
    }
}

// Hàm sắp xếp sản phẩm
function sortProducts(field, direction) {
    currentSort = { field, direction };

    // Sắp xếp filteredProducts
    filteredProducts.sort((a, b) => {
        let valueA, valueB;

        if (field === 'price') {
            valueA = a.price;
            valueB = b.price;
        } else if (field === 'name') {
            valueA = a.title.toLowerCase();
            valueB = b.title.toLowerCase();
        }

        if (direction === 'asc') {
            return valueA > valueB ? 1 : valueA < valueB ? -1 : 0;
        } else {
            return valueA < valueB ? 1 : valueA > valueB ? -1 : 0;
        }
    });

    // Reset về trang 1
    currentPage = 1;

    // Render lại
    renderPage();

    // Cập nhật UI
    updateSortUI(field, direction);
}

// Hàm reset sắp xếp
function resetSort() {
    currentSort = { field: null, direction: null };

    // Áp dụng lại filter (nếu có) nhưng không sắp xếp
    filterProducts();

    // Cập nhật UI
    updateSortUI(null, null);
}

// Hàm cập nhật UI sắp xếp
function updateSortUI(field, direction) {
    const sortInfo = document.getElementById('sortInfo');
    const buttons = document.querySelectorAll('.sort-btn:not(.reset-btn)');

    // Remove active class from all buttons
    buttons.forEach(btn => btn.classList.remove('active'));

    if (field && direction) {
        // Add active class to current sort button
        buttons.forEach(btn => {
            const btnText = btn.textContent.trim();
            if ((field === 'name' && btnText.includes('Tên') &&
                ((direction === 'asc' && btnText.includes('↑')) ||
                    (direction === 'desc' && btnText.includes('↓')))) ||
                (field === 'price' && btnText.includes('Giá') &&
                    ((direction === 'asc' && btnText.includes('↑')) ||
                        (direction === 'desc' && btnText.includes('↓'))))) {
                btn.classList.add('active');
            }
        });

        // Update sort info
        const fieldName = field === 'price' ? 'Giá' : 'Tên';
        const directionName = direction === 'asc' ? 'tăng dần' : 'giảm dần';
        sortInfo.textContent = `Đang sắp xếp theo: ${fieldName} ${directionName}`;
    } else {
        sortInfo.textContent = '';
    }
}

// Hàm mở modal xem ảnh full size
function openModal(imageSrc) {
    const modal = document.getElementById('imageModal');
    const modalImg = document.getElementById('modalImage');
    modal.style.display = 'block';
    modalImg.src = imageSrc;
}

// Đóng modal khi click vào nút close hoặc click ra ngoài ảnh
document.querySelector('.close').onclick = function () {
    document.getElementById('imageModal').style.display = 'none';
}

document.getElementById('imageModal').onclick = function (e) {
    if (e.target === this) {
        this.style.display = 'none';
    }
}

// Gọi hàm getAll khi trang được load
window.addEventListener('DOMContentLoaded', getAll);
