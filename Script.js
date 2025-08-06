let registeredUser = null;
const adminFee = 3000;

let currentFormId = null; // track form yg aktif

document.addEventListener("DOMContentLoaded", () => {
    const savedUser = localStorage.getItem("registeredUser");
    if (savedUser) {
        registeredUser = JSON.parse(savedUser);
        toggleSections(true);
        document.getElementById('userGreeting').innerText = registeredUser.username;
    } else {
        toggleSections(false);
    }

    const darkModeEnabled = localStorage.getItem("darkMode") === "true";
    if (darkModeEnabled) {
        document.body.classList.add('dark-mode');
    }
});

document.getElementById("toggle-dark-mode").addEventListener("click", function() {
    document.body.classList.toggle("dark-mode");
    localStorage.setItem("darkMode", document.body.classList.contains("dark-mode"));
    this.innerHTML = document.body.classList.contains("dark-mode") ? "🌞" : "🌙";
});

function toggleSections(isLoggedIn) {
    document.getElementById('registerFormSection').classList.toggle('hidden', isLoggedIn);
    document.getElementById('shortcutSection').classList.toggle('hidden', !isLoggedIn);
    const logoutButton = document.getElementById('logoutButton');
    if (logoutButton) logoutButton.classList.toggle('hidden', !isLoggedIn);
    const showHistoryButton = document.getElementById('showHistoryButton');
    if (showHistoryButton) showHistoryButton.classList.toggle('hidden', !isLoggedIn);
}

function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function validateRegistrationForm() {
    const username = document.getElementById('registerUsername').value.trim();
    const email = document.getElementById('registerEmail').value.trim();
    const password = document.getElementById('registerPassword').value.trim();

    if (!username || !email || !password) {
        Swal.fire("Error", "Mohon lengkapi semua field.", "error");
        return false;
    }
    if (!validateEmail(email)) {
        Swal.fire("Error", "Mohon masukkan email yang valid.", "error");
        return false;
    }
    return true;
}

function register() {
    if (validateRegistrationForm()) {
        const username = document.getElementById('registerUsername').value.trim();
        const email = document.getElementById('registerEmail').value.trim();
        const password = document.getElementById('registerPassword').value.trim();

        registeredUser = { username, email, password };
        localStorage.setItem("registeredUser", JSON.stringify(registeredUser));
        Swal.fire("Berhasil!", "Pendaftaran berhasil!", "success");
        toggleSections(true);
        document.getElementById('userGreeting').innerText = username;
    }
}

function logout() {
    Swal.fire({
        title: "Yakin ingin logout?",
        text: "Anda harus login kembali jika keluar.",
        icon: "question",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Ya, logout!",
        cancelButtonText: "Batal"
    }).then((result) => {
        if (result.isConfirmed) {
            localStorage.removeItem("registeredUser");
            registeredUser = null;
            Swal.fire("Logout Berhasil!", "Anda telah keluar.", "success");
            toggleSections(false);
            hideAllForms();
        }
    });
}

function togglePasswordVisibility() {
    const passwordInput = document.getElementById('registerPassword');
    const showPasswordCheckbox = document.getElementById('showPasswordCheckbox');
    passwordInput.type = showPasswordCheckbox.checked ? 'text' : 'password';
}

function showForm(formId) {
    if (currentFormId) {
        const oldForm = document.getElementById(currentFormId);
        if (oldForm) oldForm.classList.add('hidden');
    }
    const newForm = document.getElementById(formId);
    if (newForm) {
        newForm.classList.remove('hidden');
        currentFormId = formId;
    }
}

function hideAllForms() {
    const forms = [
        'pulsaForm', 'paketDataForm', 'tokenForm', 'eMoneyForm',
        'paymentForm', 'receiptForm', 'shortcutSection',
        'termsModal', 'transactionHistorySection'
    ];
    forms.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.classList.add('hidden');
    });
    currentFormId = null;
}

function validateFormFields(fields) {
    let valid = true;
    fields.forEach(({ id, message }) => {
        const field = document.getElementById(id);
        if (!field || field.value.trim() === "") {
            Swal.fire(message);
            valid = false;
        }
    });
    return valid;
}

function validatePulsaForm() {
    return validateFormFields([
        { id: 'phoneNumber', message: "Mohon isi nomor HP." },
        { id: 'nominalPulsa', message: "Mohon isi nominal pulsa." }
    ]);
}

function validatePaketDataForm() {
    return validateFormFields([
        { id: 'dataPhoneNumber', message: "Mohon isi nomor HP." },
        { id: 'nominalData', message: "Mohon isi nominal paket data." }
    ]);
}

function validateTokenForm() {
    return validateFormFields([
        { id: 'meterNumber', message: "Mohon isi nomor meter." },
        { id: 'nominalToken', message: "Mohon isi nominal token." }
    ]);
}

function validateEMoneyForm() {
    return validateFormFields([
        { id: 'eMoneyNumber', message: "Mohon isi nomor e-money." },
        { id: 'nominalEMoney', message: "Mohon isi nominal e-money." }
    ]);
}

function goToPayment() {
    if (validateCurrentForm()) {
        currentPaymentAmount = getCurrentPaymentAmount();
        if (currentPaymentAmount > 0) {
            document.getElementById('paymentAmount').innerText = `Rp ${currentPaymentAmount.toLocaleString()}`;
            showForm('paymentForm');
            Swal.fire("Lanjut!", "Lanjut ke pembayaran!", "info");
        }
    }
}

function getCurrentPaymentAmount() {
    const forms = [
        { formId: 'pulsaForm', inputId: 'nominalPulsa' },
        { formId: 'paketDataForm', inputId: 'nominalData' },
        { formId: 'tokenForm', inputId: 'nominalToken' },
        { formId: 'eMoneyForm', inputId: 'nominalEMoney' }
    ];

    for (const form of forms) {
        const el = document.getElementById(form.formId);
        if (el && !el.classList.contains('hidden')) {
            const nominal = parseInt(document.getElementById(form.inputId).value) || 0;
            return nominal;
        }
    }
    return 0;
}

function confirmPayment() {
    if (validatePaymentForm() && currentPaymentAmount > 0) {
        document.getElementById('receiptAmount').innerText = `Rp ${currentPaymentAmount.toLocaleString()}`;
        document.getElementById('receiptDate').innerText = new Date().toLocaleString();
        showForm('receiptForm');
        Swal.fire("Berhasil!", "Pembayaran berhasil!", "success");
    }
}

function validatePaymentForm() {
    return validateFormFields([
        { id: 'cardNumber', message: "Mohon isi nomor kartu." },
        { id: 'cardName', message: "Mohon isi nama pemegang kartu." },
        { id: 'cardCVV', message: "Mohon isi CVV." },
        { id: 'cardExpiry', message: "Mohon isi tanggal kedaluwarsa." }
    ]);
}

function saveTransactionToHistory(amount) {
    const transaction = { amount, date: new Date().toLocaleString() };
    const history = JSON.parse(localStorage.getItem("transactionHistory")) || [];
    history.push(transaction);
    localStorage.setItem("transactionHistory", JSON.stringify(history));
}

function showTransactionHistory() {
    const history = JSON.parse(localStorage.getItem("transactionHistory")) || [];
    const historySection = document.getElementById('transactionHistorySection');
    const clearHistoryButton = document.getElementById('clearHistoryButton');

    hideAllForms();

    if (history.length > 0) {
        let content = '<ul>';
        history.forEach(trx => {
            content += `<li>Amount: Rp ${trx.amount.toLocaleString()} - Date: ${trx.date}</li>`;
        });
        content += '</ul>';
        historySection.innerHTML = content;
        clearHistoryButton.classList.remove('hidden');
    } else {
        historySection.innerHTML = 'Tidak ada riwayat transaksi.';
        clearHistoryButton.classList.add('hidden');
    }
    historySection.classList.remove('hidden');
    currentFormId = 'transactionHistorySection';
}

function detectPromo(nominal) {
    return nominal > 100000 ? nominal * 0.1 : 0;
}

function updateTotalPriceWithPromo(formId, nominalInputId, totalPriceId) {
    const nominal = parseInt(document.getElementById(nominalInputId).value) || 0;
    const discount = detectPromo(nominal);
    const total = nominal + adminFee - discount;

    if (nominal > 0) {
        document.getElementById(totalPriceId).innerText = `Rp ${total.toLocaleString()}`;
        if (discount > 0) {
            Swal.fire(`Promo diterapkan! Anda mendapatkan diskon Rp ${discount.toLocaleString()}`);
        }
    } else {
        Swal.fire("Mohon isi nominal yang valid.");
    }
}

function toggleCVVVisibility() {
    const cvvInput = document.getElementById('cardCVV');
    const showCVVCheckbox = document.getElementById('showCVVCheckbox');
    cvvInput.type = showCVVCheckbox.checked ? 'text' : 'password';
}

function hidelogoutbutton() {
    const btn = document.getElementById('logout-button');
    if (btn) btn.classList.add('hidden');
}
