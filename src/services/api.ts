export interface RawSmsLog {
  id: number;
  sender: string;
  smsBody: string;
  receivedAt: string;
  amount: number;
  transactionType: string;
  paymentMode: string;
  accountRef: string;
  merchantRaw: string;
  merchantClean: string;
  category: string;
  postBalance: number;
  transactionDate: string;
  isRecurring: boolean;
  counterpartyType: string;
  upiRef: string;
}

const API_BASE_URL = 'http://localhost:8080/api/v1/transactions';

export async function fetchTransactions(): Promise<RawSmsLog[]> {
  try {
    const token = localStorage.getItem('spendsense_auth_token');
    const response = await fetch(API_BASE_URL, {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.warn("Backend transactions not ready. Falling back to local/demo data.");
    
    const token = localStorage.getItem('spendsense_auth_token');
    if (token) {
      // Production Grade: Real user gets their own local DB instead of demo data
      const localData = localStorage.getItem('spendsense_user_transactions');
      if (localData) {
        return JSON.parse(localData);
      }
      return []; // Return clean empty state
    } else {
      // Demo Mode
      return getMockData();
    }
  }
}

let cachedMockData: RawSmsLog[] | null = null;

export async function addTransaction(tx: RawSmsLog): Promise<void> {
  const token = localStorage.getItem('spendsense_auth_token');
  
  if (token) {
    const localData = localStorage.getItem('spendsense_user_transactions');
    let txs = localData ? JSON.parse(localData) : [];
    
    // Assign a unique ID
    tx.id = Date.now();
    txs = [tx, ...txs];
    
    localStorage.setItem('spendsense_user_transactions', JSON.stringify(txs));
  } else {
    if (!cachedMockData) {
      cachedMockData = getMockData();
    }
    tx.id = Date.now();
    cachedMockData = [tx, ...cachedMockData];
  }
}

function getMockData(): RawSmsLog[] {
  if (cachedMockData) return cachedMockData;
  const data: RawSmsLog[] = [];
  const now = new Date();
  
  let currentBalance = 78500;
  let idCounter = 1;
  
  // 1. Add Monthly Income at the beginning of the cycle (approx 25 days ago)
  const incomeDate = new Date(now.getTime() - 25 * 86400000);
  data.push({
    id: idCounter++,
    sender: "HDFC-INCM",
    smsBody: `Cr. Rs 95,000 to A/c X1234. Post Bal: Rs ${currentBalance + 95000}`,
    receivedAt: incomeDate.toISOString(),
    amount: 95000,
    transactionType: "CREDIT",
    paymentMode: "NEFT",
    accountRef: "HDFC X1234",
    merchantRaw: "ACME CORP PAYROLL",
    merchantClean: "Acme Corp Salary",
    category: "Income",
    postBalance: currentBalance + 95000,
    transactionDate: incomeDate.toISOString(),
    isRecurring: true,
    counterpartyType: "ORGANIZATION",
    upiRef: ""
  });
  currentBalance += 95000;

  // Generate daily transactions
  for (let i = 29; i >= 0; i--) {
    const date = new Date(now.getTime() - i * 86400000);
    const dayOfWeek = date.getDay(); // 0 = Sunday, 6 = Saturday
    const isToday = i === 0;
    
    // Standard daily expenses: Transport or Groceries
    if (dayOfWeek !== 0 && !isToday) {
      data.push({
        id: idCounter++,
        sender: "SBI-TXN",
        smsBody: `Dr. Rs 150 at OLA RIDES. Post Bal: Rs ${currentBalance - 150}`,
        receivedAt: new Date(date.getTime() + 9 * 3600000).toISOString(), // 9 AM
        amount: 150,
        transactionType: "DEBIT",
        paymentMode: "UPI",
        accountRef: "SBI X5678",
        merchantRaw: "OLA RIDES",
        merchantClean: "Ola Cabs",
        category: "Transport & Fuel",
        postBalance: currentBalance - 150,
        transactionDate: new Date(date.getTime() + 9 * 3600000).toISOString(),
        isRecurring: false,
        counterpartyType: "MERCHANT",
        upiRef: "UPI8892182"
      });
      currentBalance -= 150;
    }
    
    // Wednesdays: Shopping spree
    if (dayOfWeek === 3 && !isToday) {
      data.push({
        id: idCounter++,
        sender: "HDFC-TXN",
        smsBody: `Dr. Rs 2400 at MYNTRA FASHIONS. Post Bal: Rs ${currentBalance - 2400}`,
        receivedAt: new Date(date.getTime() + 19 * 3600000).toISOString(), // 7 PM
        amount: 2400,
        transactionType: "DEBIT",
        paymentMode: "CARD",
        accountRef: "HDFC X1234",
        merchantRaw: "MYNTRA FASHIONS",
        merchantClean: "Myntra Store",
        category: "Shopping",
        postBalance: currentBalance - 2400,
        transactionDate: new Date(date.getTime() + 19 * 3600000).toISOString(),
        isRecurring: false,
        counterpartyType: "MERCHANT",
        upiRef: ""
      });
      currentBalance -= 2400;
    }

    // Friday and Saturday: Entertainment & Food & Dining
    if ((dayOfWeek === 5 || dayOfWeek === 6) && !isToday) {
      // Dining out
      data.push({
        id: idCounter++,
        sender: "HDFC-TXN",
        smsBody: `Dr. Rs 1800 at THE SOCIAL CAFE. Post Bal: Rs ${currentBalance - 1800}`,
        receivedAt: new Date(date.getTime() + 21 * 3600000).toISOString(), // 9 PM
        amount: 1800,
        transactionType: "DEBIT",
        paymentMode: "UPI",
        accountRef: "HDFC X1234",
        merchantRaw: "THE SOCIAL CAFE",
        merchantClean: "Social Restaurant",
        category: "Food & Dining",
        postBalance: currentBalance - 1800,
        transactionDate: new Date(date.getTime() + 21 * 3600000).toISOString(),
        isRecurring: false,
        counterpartyType: "MERCHANT",
        upiRef: "UPI9823122"
      });
      currentBalance -= 1800;

      // Cinema/Show
      data.push({
        id: idCounter++,
        sender: "SBI-TXN",
        smsBody: `Dr. Rs 850 at BOOKMYSHOW. Post Bal: Rs ${currentBalance - 850}`,
        receivedAt: new Date(date.getTime() + 16 * 3600000).toISOString(), // 4 PM
        amount: 850,
        transactionType: "DEBIT",
        paymentMode: "UPI",
        accountRef: "SBI X5678",
        merchantRaw: "BOOKMYSHOW ENTERTAINMENT",
        merchantClean: "BookMyShow",
        category: "Entertainment",
        postBalance: currentBalance - 850,
        transactionDate: new Date(date.getTime() + 16 * 3600000).toISOString(),
        isRecurring: false,
        counterpartyType: "MERCHANT",
        upiRef: "UPI0238192"
      });
      currentBalance -= 850;
    }
    
    // Sunday: Groceries
    if (dayOfWeek === 0 && !isToday) {
      data.push({
        id: idCounter++,
        sender: "SBI-TXN",
        smsBody: `Dr. Rs 1200 at BIG BASKET. Post Bal: Rs ${currentBalance - 1200}`,
        receivedAt: new Date(date.getTime() + 11 * 3600000).toISOString(), // 11 AM
        amount: 1200,
        transactionType: "DEBIT",
        paymentMode: "UPI",
        accountRef: "SBI X5678",
        merchantRaw: "BIG BASKET INTL",
        merchantClean: "BigBasket",
        category: "Groceries",
        postBalance: currentBalance - 1200,
        transactionDate: new Date(date.getTime() + 11 * 3600000).toISOString(),
        isRecurring: false,
        counterpartyType: "MERCHANT",
        upiRef: "UPI1192831"
      });
      currentBalance -= 1200;
    }
    
    // Generate 3 items for TODAY to let the user review them!
    if (isToday) {
      // 1. Lunch
      data.push({
        id: idCounter++,
        sender: "HDFC-TXN",
        smsBody: `Dr. Rs 420 at SWIGGY FOODS. Post Bal: Rs ${currentBalance - 420}`,
        receivedAt: new Date(date.getTime() + 13 * 3600000).toISOString(), // 1 PM
        amount: 420,
        transactionType: "DEBIT",
        paymentMode: "UPI",
        accountRef: "HDFC X1234",
        merchantRaw: "SWIGGY FOODS",
        merchantClean: "Swiggy Delivery",
        category: "Food & Dining",
        postBalance: currentBalance - 420,
        transactionDate: new Date(date.getTime() + 13 * 3600000).toISOString(),
        isRecurring: false,
        counterpartyType: "MERCHANT",
        upiRef: "UPI9028341"
      });
      currentBalance -= 420;

      // 2. Cab
      data.push({
        id: idCounter++,
        sender: "SBI-TXN",
        smsBody: `Dr. Rs 280 at UBER RIDES. Post Bal: Rs ${currentBalance - 280}`,
        receivedAt: new Date(date.getTime() + 18 * 3600000).toISOString(), // 6 PM
        amount: 280,
        transactionType: "DEBIT",
        paymentMode: "UPI",
        accountRef: "SBI X5678",
        merchantRaw: "UBER RIDES INDIA",
        merchantClean: "Uber Cabs",
        category: "Transport & Fuel",
        postBalance: currentBalance - 280,
        transactionDate: new Date(date.getTime() + 18 * 3600000).toISOString(),
        isRecurring: false,
        counterpartyType: "MERCHANT",
        upiRef: "UPI3928412"
      });
      currentBalance -= 280;

      // 3. Quick Coffee
      data.push({
        id: idCounter++,
        sender: "HDFC-TXN",
        smsBody: `Dr. Rs 180 at STARBUCKS COFFEE. Post Bal: Rs ${currentBalance - 180}`,
        receivedAt: new Date(date.getTime() + 15 * 3600000).toISOString(), // 3 PM
        amount: 180,
        transactionType: "DEBIT",
        paymentMode: "UPI",
        accountRef: "HDFC X1234",
        merchantRaw: "STARBUCKS COFFEE CO",
        merchantClean: "Starbucks Coffee",
        category: "Food & Dining",
        postBalance: currentBalance - 180,
        transactionDate: new Date(date.getTime() + 15 * 3600000).toISOString(),
        isRecurring: false,
        counterpartyType: "MERCHANT",
        upiRef: "UPI4918239"
      });
      currentBalance -= 180;
    }
  }
  
  // Sort reverse chronologically
  cachedMockData = data.sort((a, b) => new Date(b.transactionDate).getTime() - new Date(a.transactionDate).getTime());
  return cachedMockData;
}
