import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Calendar, FileText, Download, Clock, DollarSign, TrendingUp, Building, Calculator, Eye, ChevronDown, ChevronUp, Sparkles } from 'lucide-react';

const generatePayslipPDF = (payslipData, formatCurrency) => {
  
  return `
    <div style="padding: 20px; font-family: Arial, sans-serif;">
      <!-- Header -->
      <div style="text-align: center; margin-bottom: 20px;">
        <h1 style="margin: 0;">${payslipData.fullName}</h1>
      </div>

      <!-- Left Info Section -->
      <div style="margin-bottom: 20px;">
        <p><strong>Payroll Period:</strong> ${payslipData.period}</p>
        <p><strong>Employment Type:</strong> ${payslipData.employmentType.charAt(0).toUpperCase() + payslipData.employmentType.slice(1)}</p>
        ${payslipData.employmentType === "regular"
        ? `<p><strong>Salary Grade:</strong> ${payslipData.salaryGrade || ''}</p>`
        : ''}
        ${
          payslipData.employmentType === "regular"
            ? `<p><strong>Worked Days:</strong> ${payslipData.daysPresent} / ${payslipData.workingDays}</p>`
            : `<p><strong>Total Hours:</strong> ${payslipData.totalHours} hours</p>`
        }
      </div>

      <!-- Combined Earnings and Deductions Table -->
      <div style="margin-bottom: 30px;">
        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr style="background-color: #f2f2f2;">
              <th style="padding: 8px; text-align: left; border: 1px solid #ccc;">Earnings</th>
              <th style="padding: 8px; text-align: right; border: 1px solid #ccc;">Amount</th>
              <th style="padding: 8px; text-align: left; border: 1px solid #ccc;">Deductions</th>
              <th style="padding: 8px; text-align: right; border: 1px solid #ccc;">Amount</th>
            </tr>
          </thead>
          <tbody>
            ${
              // Calculate the maximum number of rows
              Array.from({
                length: Math.max(
                  payslipData.employmentType === 'regular' ? 1 + (payslipData.bonuses?.length || 0) : 1 + (payslipData.bonuses?.length || 0),
                  payslipData.deductions?.length || 0
                )
              }).map((_, i) => {
                const earningLabel = i === 0
                  ? (payslipData.employmentType === 'regular' ? 'Basic' : 'Hourly Rate')
                  : payslipData.bonuses?.[i - 1]?.label || '';
                const earningAmount = i === 0
                  ? formatCurrency(payslipData.employmentType === 'regular' ? payslipData.ratePerMonth : payslipData.ratePerHour)
                  : payslipData.bonuses?.[i - 1]?.amount
                    ? formatCurrency(payslipData.bonuses[i - 1].amount)
                    : '';

                const deduction = payslipData.deductions?.[i];
                const deductionLabel = deduction?.label || '';
                const deductionAmount = deduction?.amount !== undefined ? formatCurrency(deduction.amount) : '';

                return `
                  <tr>
                    <td style="padding: 6px; border: 1px solid #ccc;">${earningLabel}</td>
                    <td style="padding: 6px; text-align: right; border: 1px solid #ccc;">${earningAmount}</td>
                    <td style="padding: 6px; border: 1px solid #ccc;">${deductionLabel}</td>
                    <td style="padding: 6px; text-align: right; border: 1px solid #ccc;">${deductionAmount}</td>
                  </tr>
                `;
              }).join('')
            }
            <tr>
              <td style="padding: 6px; font-weight: bold; border: 1px solid #ccc;">Total Earnings</td>
              <td style="padding: 6px; text-align: right; font-weight: bold; border: 1px solid #ccc;">${formatCurrency(payslipData.grossIncome)}</td>
              <td style="padding: 6px; font-weight: bold; border: 1px solid #ccc;">Total Deductions</td>
              <td style="padding: 6px; text-align: right; font-weight: bold; border: 1px solid #ccc;">${formatCurrency(payslipData.deductions.reduce((sum, d) => sum + d.amount, 0))}</td>
            </tr>
            <tr>
              <td colspan="2" style="padding: 10px; font-size: 16px; font-weight: bold; text-align: center; border: 1px solid #ccc;">Net Pay</td>
              <td colspan="2" style="padding: 10px; font-size: 16px; font-weight: bold; text-align: right; border: 1px solid #ccc;">${formatCurrency(payslipData.netPay)}</td>
            </tr>
          </tbody>
        </table>
      </div>

  `;
};

const generateSummaryPDF = (summaryData, formatCurrency) => {
  const periods = summaryData.periods?.join(', ') || '';
  const periodCount = summaryData.periods?.length || 0;
  
  // Compact layout for 1-3 periods
  if (periodCount <= 3) {
    return `
      <html>
        <head>
          <title>Payroll Summary Report - ${summaryData.fullName}</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              margin: 0; 
              padding: 15px;
              font-size: 12px;
            }
            .summary-report { 
              width: 100%; 
              max-width: 100%;
            }
            h1 {
              font-size: 18px;
              margin: 5px 0;
              text-align: center;
            }
            .employee-info {
              text-align: center;
              margin-bottom: 10px;
              font-size: 12px;
            }
            h2 {
              font-size: 14px;
              margin: 15px 0 5px 0;
              border-bottom: 1px solid #000;
              padding-bottom: 3px;
            }
            table { 
              width: 100%; 
              border-collapse: collapse; 
              margin-bottom: 15px;
              page-break-inside: avoid;
            }
            th, td { 
              padding: 5px; 
              text-align: left; 
              border: 1px solid #ddd; 
            }
            th { 
              background-color: #f2f2f2; 
              font-weight: bold; 
            }
            .text-right { 
              text-align: right; 
            }
            .text-center { 
              text-align: center; 
            }
            .font-bold { 
              font-weight: bold; 
            }
            .total-row {
              font-weight: bold;
              background-color: #f5f5f5;
            }
            .footer {
              text-align: center;
              font-size: 10px;
              margin-top: 10px;
              padding-top: 5px;
            }
            @media print {
              @page {
                size: portrait;
                margin: 10mm;
              }
            }
          </style>
        </head>
        <body>
          <div class="summary-report">
            <h1>Payroll Summary Report</h1>
            <div class="employee-info">
              ${summaryData.fullName}<br>
              ${summaryData.employmentType.charAt(0).toUpperCase() + summaryData.employmentType.slice(1)} Employee | Grade ${summaryData.salaryGrade}<br>
              Period: ${periods}
            </div>

            <h2>Period Summary</h2>
            <table>
              <thead>
                <tr>
                  <th>Period</th>
                  <th class="text-right">Income</th>
                  <th class="text-right">Deductions</th>
                  <th class="text-right">Net Pay</th>
                </tr>
              </thead>
              <tbody>
                ${Object.entries(summaryData.periodSummary).map(([period, data]) => `
                  <tr>
                    <td>${period}</td>
                    <td class="text-right">${formatCurrency(data.gross_income)}</td>
                    <td class="text-right">${formatCurrency(data.total_deductions)}</td>
                    <td class="text-right">${formatCurrency(data.net_income)}</td>
                  </tr>
                `).join('')}
                <tr class="total-row">
                  <td>TOTAL</td>
                  <td class="text-right">${formatCurrency(Object.values(summaryData.periodSummary || {}).reduce((sum, d) => sum + d.gross_income, 0))}</td>
                  <td class="text-right">${formatCurrency(Object.values(summaryData.periodSummary || {}).reduce((sum, d) => sum + d.total_deductions, 0))}</td>
                  <td class="text-right">${formatCurrency(Object.values(summaryData.periodSummary || {}).reduce((sum, d) => sum + d.net_income, 0))}</td>
                </tr>
              </tbody>
            </table>

            <h2>Income Breakdown</h2>
            <table>
              <thead>
                <tr>
                  <th>Income Type</th>
                  ${Object.keys(summaryData.periodSummary).map(p => `
                    <th class="text-right">${p}</th>
                  `).join('')}
                  <th class="text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                ${Object.entries(summaryData.incomeBreakdown).map(([incomeType, amounts]) => {
                  const row = Object.keys(summaryData.periodSummary).map(period => `
                    <td class="text-right">${amounts[period] ? formatCurrency(amounts[period]) : '-'}</td>
                  `).join('');
                  const total = formatCurrency(Object.values(amounts).reduce((sum, a) => sum + a, 0));
                  return `
                    <tr>
                      <td>${incomeType}</td>
                      ${row}
                      <td class="text-right font-bold">${total}</td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>

            <h2>Deduction Breakdown</h2>
            <table>
              <thead>
                <tr>
                  <th>Deduction Type</th>
                  ${Object.keys(summaryData.periodSummary).map(p => `
                    <th class="text-right">${p}</th>
                  `).join('')}
                  <th class="text-right">Total</th>
                  <th class="text-right">Current Balance</th>
                </tr>
              </thead>
              <tbody>
                ${Object.entries(summaryData.deductionBreakdown)
                  .filter(([key]) => !key.endsWith('_balance'))
                  .map(([deductionType, amounts]) => {
                    const balanceKey = `${deductionType}_balance`;
                    const lastPeriod = summaryData.periods?.slice(-1)[0] || '';
                    const balance = summaryData.deductionBreakdown[balanceKey]?.[lastPeriod] || 0;
                    const row = Object.keys(summaryData.periodSummary).map(period => `
                      <td class="text-right">${amounts[period] ? formatCurrency(amounts[period]) : '-'}</td>
                    `).join('');
                    const total = formatCurrency(Object.values(amounts).reduce((sum, a) => sum + a, 0));
                    return `
                      <tr>
                        <td>${deductionType}</td>
                        ${row}
                        <td class="text-right font-bold">${total}</td>
                        <td class="text-right">${formatCurrency(balance)}</td>
                      </tr>
                    `;
                  }).join('')}
              </tbody>
            </table>

            <div class="footer">
              This is a system generated payroll summary report<br>
              Generated on: ${new Date().toLocaleDateString()}
            </div>
          </div>
        </body>
      </html>
    `;
  }

  // Landscape layout for 4+ periods
  return `
    <html>
      <head>
        <title>Payroll Summary Report - ${summaryData.fullName}</title>
        <style>
          body { 
            font-family: Arial, sans-serif; 
            margin: 0; 
            padding: 15px;
            font-size: 11px;
          }
          .summary-report { 
            width: 100%; 
            max-width: 100%;
          }
          h1 {
            font-size: 16px;
            margin: 5px 0;
            text-align: center;
          }
          .employee-info {
            text-align: center;
            margin-bottom: 8px;
            font-size: 11px;
          }
          h2 {
            font-size: 13px;
            margin: 10px 0 5px 0;
            border-bottom: 1px solid #000;
            padding-bottom: 3px;
          }
          table { 
            width: 100%; 
            border-collapse: collapse; 
            margin-bottom: 10px;
            page-break-inside: avoid;
          }
          th, td { 
            padding: 4px; 
            text-align: left; 
            border: 1px solid #ddd; 
          }
          th { 
            background-color: #f2f2f2; 
            font-weight: bold; 
          }
          .text-right { 
            text-align: right; 
          }
          .text-center { 
            text-align: center; 
          }
          .font-bold { 
            font-weight: bold; 
          }
          .nowrap {
            white-space: nowrap;
          }
          .sticky-header {
            position: sticky;
            top: 0;
            background-color: #f2f2f2;
          }
          .footer {
            text-align: center;
            font-size: 9px;
            margin-top: 8px;
            padding-top: 4px;
          }
          @media print {
            @page {
              size: landscape;
              margin: 7mm;
            }
          }
        </style>
      </head>
      <body>
        <div class="summary-report">
          <h1>Payroll Summary Report</h1>
          <div class="employee-info">
            ${summaryData.fullName}<br>
            ${summaryData.employmentType.charAt(0).toUpperCase() + summaryData.employmentType.slice(1)} Employee | Grade ${summaryData.salaryGrade}<br>
            Period: ${periods}
          </div>

          <h2>Period Summary</h2>
          <table>
            <thead>
              <tr>
                <th>Period</th>
                <th class="text-right">Income</th>
                <th class="text-right">Deductions</th>
                <th class="text-right">Net Pay</th>
              </tr>
            </thead>
            <tbody>
              ${Object.entries(summaryData.periodSummary).map(([period, data]) => `
                <tr>
                  <td class="nowrap">${period}</td>
                  <td class="text-right">${formatCurrency(data.gross_income)}</td>
                  <td class="text-right">${formatCurrency(data.total_deductions)}</td>
                  <td class="text-right">${formatCurrency(data.net_income)}</td>
                </tr>
              `).join('')}
              <tr class="font-bold">
                <td>TOTAL</td>
                <td class="text-right">${formatCurrency(Object.values(summaryData.periodSummary || {}).reduce((sum, d) => sum + d.gross_income, 0))}</td>
                <td class="text-right">${formatCurrency(Object.values(summaryData.periodSummary || {}).reduce((sum, d) => sum + d.total_deductions, 0))}</td>
                <td class="text-right">${formatCurrency(Object.values(summaryData.periodSummary || {}).reduce((sum, d) => sum + d.net_income, 0))}</td>
              </tr>
            </tbody>
          </table>

          <h2>Income Breakdown</h2>
          <table>
            <thead>
              <tr>
                <th>Income Type</th>
                ${Object.keys(summaryData.periodSummary).map(p => `
                  <th class="text-right nowrap">${p}</th>
                `).join('')}
                <th class="text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              ${Object.entries(summaryData.incomeBreakdown).map(([incomeType, amounts]) => {
                const row = Object.keys(summaryData.periodSummary).map(period => `
                  <td class="text-right">${amounts[period] ? formatCurrency(amounts[period]) : '-'}</td>
                `).join('');
                const total = formatCurrency(Object.values(amounts).reduce((sum, a) => sum + a, 0));
                return `
                  <tr>
                    <td class="nowrap">${incomeType}</td>
                    ${row}
                    <td class="text-right font-bold">${total}</td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>

          <h2>Deduction Breakdown</h2>
          <table>
            <thead>
              <tr>
                <th>Deduction Type</th>
                ${Object.keys(summaryData.periodSummary).map(p => `
                  <th class="text-right nowrap">${p}</th>
                `).join('')}
                <th class="text-right">Total</th>
                <th class="text-right">Current Balance</th>
              </tr>
            </thead>
            <tbody>
              ${Object.entries(summaryData.deductionBreakdown)
                .filter(([key]) => !key.endsWith('_balance'))
                .map(([deductionType, amounts]) => {
                  const balanceKey = `${deductionType}_balance`;
                  const lastPeriod = summaryData.periods?.slice(-1)[0] || '';
                  const balance = summaryData.deductionBreakdown[balanceKey]?.[lastPeriod] || 0;
                  const row = Object.keys(summaryData.periodSummary).map(period => `
                    <td class="text-right">${amounts[period] ? formatCurrency(amounts[period]) : '-'}</td>
                  `).join('');
                  const total = formatCurrency(Object.values(amounts).reduce((sum, a) => sum + a, 0));
                  return `
                    <tr>
                      <td class="nowrap">${deductionType}</td>
                      ${row}
                      <td class="text-right font-bold">${total}</td>
                      <td class="text-right">${formatCurrency(balance)}</td>
                    </tr>
                  `;
                }).join('')}
            </tbody>
          </table>

          <div class="footer">
            This is a system generated payroll summary report<br>
            Generated on: ${new Date().toLocaleDateString()}
          </div>
        </div>
      </body>
    </html>
  `;
};

const InsightsPanel = ({ 
  generatingInsights, 
  insights, 
  selectedPeriods, 
  payslip, 
  summaryReport, 
  getPayslipInsights, 
  setInsights 
}) => (
  <div className="bg-white rounded-xl shadow-lg border border-gray-200 mt-8 overflow-hidden">
    <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-6">
      <div className="flex items-center gap-3">
        <Sparkles className="w-6 h-6" />
        <h2 className="text-xl font-bold">AI-Powered Insights</h2>
      </div>
    </div>
    
    <div className="p-6">
      {generatingInsights ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
          <span className="ml-3 text-gray-600">Generating insights...</span>
        </div>
      ) : insights ? (
        <div className="prose max-w-none">
          <ul className="space-y-2">
            {insights.split('\n').map((item, index) => (
              <li key={index} className="flex items-start">
                <span className="text-purple-600 mr-2">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          <p>Get AI-powered analysis of your payroll data</p>
          <button
            onClick={async () => {
              const dataToAnalyze = selectedPeriods.length === 1 ? payslip : summaryReport;
              const result = await getPayslipInsights(dataToAnalyze);
              setInsights(result);
            }}
            className="mt-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-6 py-2 rounded-lg font-medium flex items-center gap-2 mx-auto"
          >
            <Sparkles className="w-4 h-4" />
            Generate Insights
          </button>
        </div>
      )}
    </div>
  </div>
);

const ReportsPage = () => {
  const [payslip, setPayslip] = useState(null);
  const [summaryReport, setSummaryReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedPeriods, setSelectedPeriods] = useState([]);
  const [availablePeriods, setAvailablePeriods] = useState([]);
  const [error, setError] = useState(null);
  const [showPeriodPicker, setShowPeriodPicker] = useState(true);
  const [insights, setInsights] = useState(null);
  const [generatingInsights, setGeneratingInsights] = useState(false);

  const storedUser = JSON.parse(localStorage.getItem('user'));
  const username = storedUser?.username;

  useEffect(() => {
    const fetchAvailablePeriods = async () => {
      try {
        const response = await axios.get('https://backend2-2szh.onrender.com/available-months', {
          params: { username }
        });
        // Transform the data to include period ranges
        const transformed = response.data.map(period => ({
          ...period,
          display: `${period.month} ${period.period_start}-${period.period_end}, ${period.year}`
        }));
        setAvailablePeriods(transformed);
      } catch (err) {
        console.error("Failed to fetch available periods", err);
      }
    };
    fetchAvailablePeriods();
  }, [username]);

  useEffect(() => {
    const fetchData = async () => {
      if (selectedPeriods.length === 0) return;

      setLoading(true);
      setError(null);
      setPayslip(null);
      setSummaryReport(null);

      try {
        if (selectedPeriods.length === 1) {
          const period = selectedPeriods[0];
          console.log("📦 Fetching payslip with:", period);
          const response = await axios.get('https://backend2-2szh.onrender.com/payslip', {
            params: {
              username,
              month: period.month,
              year: period.year,
              period_start: period.period_start,
              period_end: period.period_end
            }
          });
          setPayslip(response.data);
        } else {
          const response = await axios.post('https://backend2-2szh.onrender.com/api/payslip/summary', {
            username,
            selected_periods: selectedPeriods.map(p => ({
              month: p.month,
              year: p.year,
              period_start: p.period_start,
              period_end: p.period_end
            }))
          });
          setSummaryReport(response.data);
        }
      } catch (err) {
        console.error("Failed to fetch data", err);
        if (err.response?.status === 404) {
          const detail = err.response?.data?.detail;
          if (detail?.available_periods) {
            setAvailablePeriods(detail.available_periods);
          }
          setError(detail?.error || "No data found for selected period");
        } else {
          setError("Unable to load data. Please try again.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedPeriods, username]);

  const getPayslipInsights = async (payslipData) => {
    try {
      setGeneratingInsights(true);
      const response = await axios.post('https://backend2-2szh.onrender.com/api/insights/generate', {
        payslip_data: payslipData,
        analysis_type: "standard",
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      return response.data.insights;
    } catch (error) {
      console.error("Error getting insights:", error);
      return "Unable to generate insights at this time. Please try again later.";
    } finally {
      setGeneratingInsights(false);
    }
  };

  const handlePrint = () => {
  const printWindow = window.open('', '_blank');

  if (selectedPeriods.length === 1 && payslip) {
    printWindow.document.write(`
      <html>
        <head>
          <title>Payslip - ${payslip.fullName}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
            th, td { padding: 8px; text-align: left; border-bottom: 1px solid #ddd; }
            th { background-color: #f2f2f2; font-weight: bold; }
            .text-right { text-align: right; }
            .text-center { text-align: center; }
            .font-bold { font-weight: bold; }
          </style>
        </head>
        <body>
          ${generatePayslipPDF(payslip, formatCurrency)}
        </body>
      </html>
    `);
  } else if (selectedPeriods.length > 1 && summaryReport && summaryReport.periodSummary) {
    printWindow.document.write(generateSummaryPDF(summaryReport, formatCurrency));
  } else {
    printWindow.close();
    return;
  }

  printWindow.document.close();
  printWindow.focus();

  setTimeout(() => {
    printWindow.print();
  }, 500);
};

  const handlePeriodSelection = (e, periodEntry) => {
    const periodKey = `${periodEntry.month}-${periodEntry.year}-${periodEntry.period_start}-${periodEntry.period_end}`;
    if (e.target.checked) {
      if (selectedPeriods.length < 12) {
        setSelectedPeriods([...selectedPeriods, periodEntry]);
      }
    } else {
      setSelectedPeriods(selectedPeriods.filter(p => 
        `${p.month}-${p.year}-${p.period_start}-${p.period_end}` !== periodKey
      ));
    }
  };

  const isPeriodSelected = (periodEntry) => {
    return selectedPeriods.some(p => 
      p.month === periodEntry.month && 
      p.year === periodEntry.year && 
      p.period_start === periodEntry.period_start && 
      p.period_end === periodEntry.period_end
    );
  };
  // State declarations (place near top of your component)
  const [yearFilter, setYearFilter] = useState('');
  const [fromMonth, setFromMonth] = useState('');
  const [toMonth, setToMonth] = useState('');

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  const formatCurrency = (amount) => {
    return `₱${amount?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const StatCard = ({ icon: Icon, label, value, className = "" }) => (
    <div className={`bg-white rounded-xl p-6 shadow-md border border-gray-100 hover:shadow-lg transition-all duration-300 ${className}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 mb-1">{label}</p>
          <div className="text-2xl font-bold text-gray-900">{value}</div>
        </div>
        <div className="p-3 bg-blue-50 rounded-lg">
          <Icon className="w-6 h-6 text-blue-600" />
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
            <FileText className="w-8 h-8 text-blue-600" />
            Payroll Reports
          </h1>
          <p className="text-gray-600">Generate and view your payroll summaries and detailed reports</p>
        </div>

        {/* Period Selection Card */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 mb-8 overflow-hidden">
          <div 
            className="p-6 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors"
            onClick={() => setShowPeriodPicker(!showPeriodPicker)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Calendar className="w-6 h-6 text-blue-600" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Select Report Period</h3>
                  <p className="text-sm text-gray-600">Choose up to 12 periods to include in your report</p>
                </div>
              </div>
              {showPeriodPicker ? (
                <ChevronUp className="w-5 h-5 text-gray-400" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-400" />
              )}
            </div>
          </div>
          
              {showPeriodPicker && (
              <div className="p-6">
                {/* Filters */}
                <div className="mb-6 flex flex-wrap gap-4 items-end">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Filter by Year</label>
                    <select
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                      value={yearFilter}
                      onChange={(e) => setYearFilter(e.target.value)}
                    >
                      <option value="">All</option>
                      {[...new Set(availablePeriods.map(p => p.year))]
                        .sort((a, b) => b - a)
                        .map(year => (
                          <option key={year} value={year}>{year}</option>
                        ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">From Month</label>
                    <select
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                      value={fromMonth}
                      onChange={(e) => setFromMonth(e.target.value)}
                    >
                      <option value="">--</option>
                      {months.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">To Month</label>
                    <select
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                      value={toMonth}
                      onChange={(e) => setToMonth(e.target.value)}
                    >
                      <option value="">--</option>
                      {months.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                  </div>

                  <div>
                    <button
                      onClick={() => {
                        setYearFilter('');
                        setFromMonth('');
                        setToMonth('');
                      }}
                      className="text-sm mt-1 px-4 py-2 rounded-md bg-gray-200 hover:bg-gray-300 text-gray-700"
                    >
                      Clear Filters
                    </button>
                  </div>
                </div>

                {/* Payslip Selection Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-4">
                  {availablePeriods
                    .filter(p => {
                      const matchesYear = yearFilter ? p.year === parseInt(yearFilter) : true;

                      const monthIndex = months.indexOf(p.month);
                      const fromIndex = fromMonth ? months.indexOf(fromMonth) : 0;
                      const toIndex = toMonth ? months.indexOf(toMonth) : 11;
                      const matchesMonth = fromMonth && toMonth
                        ? monthIndex >= fromIndex && monthIndex <= toIndex
                        : true;

                      return matchesYear && matchesMonth;
                    })
                    .map((periodEntry) => (
                      <label
                        key={`${periodEntry.month}-${periodEntry.year}-${periodEntry.period_start}-${periodEntry.period_end}`}
                        className={`flex items-center p-3 rounded-lg border-2 cursor-pointer transition-all duration-200 hover:bg-blue-50 ${
                          isPeriodSelected(periodEntry)
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-gray-200 hover:border-blue-300'
                        } ${
                          selectedPeriods.length >= 12 && !isPeriodSelected(periodEntry)
                            ? 'opacity-50 cursor-not-allowed'
                            : ''
                        }`}
                      >
                        <input
                          type="checkbox"
                          className="sr-only"
                          checked={isPeriodSelected(periodEntry)}
                          onChange={(e) => handlePeriodSelection(e, periodEntry)}
                          disabled={selectedPeriods.length >= 12 && !isPeriodSelected(periodEntry)}
                        />
                        <div className={`w-4 h-4 border-2 rounded mr-3 flex items-center justify-center ${
                          isPeriodSelected(periodEntry) ? 'border-blue-500 bg-blue-500' : 'border-gray-300'
                        }`}>
                          {isPeriodSelected(periodEntry) && (
                            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          )}
                        </div>
                        <span className="font-medium">{periodEntry.display}</span>
                      </label>
                    ))}
                </div>

                {/* Selected Period Display */}
                {selectedPeriods.length > 0 && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Eye className="w-4 h-4 text-blue-600" />
                      <span className="font-medium text-blue-700">Selected Periods:</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {selectedPeriods.map(period => (
                        <span key={`${period.month}-${period.year}-${period.period_start}-${period.period_end}`} 
                          className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                          {period.display}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

        {loading && (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 text-lg">Loading your payroll data...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                <span className="text-red-600 font-bold">!</span>
              </div>
              <p className="text-red-700 font-medium">{error}</p>
            </div>
          </div>
        )}

        {/* Single Period Payslip View */}
        {payslip && selectedPeriods.length === 1 && (
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold mb-1">{payslip.fullName}</h1>
                  <p className="text-blue-100 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    {payslip.period} | {payslip.employmentType.charAt(0).toUpperCase() + payslip.employmentType.slice(1)} Employee
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-blue-100 text-sm">Net Pay</p>
                  <p className="text-3xl font-bold">{formatCurrency(payslip.netPay)}</p>
                </div>
              </div>
            </div>

            <div className="p-6">
              {/* Summary Stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <StatCard
                  icon={Calendar}
                  label="Working Days"
                  value={payslip.workingDays}
                />
                <StatCard
                  icon={Clock}
                  label="Days Present"
                  value={payslip.daysPresent}
                  className="border-l-4 border-l-green-500"
                />
                {payslip.daysAbsent !== undefined && (
                  <StatCard
                    icon={Clock}
                    label="Days Absent"
                    value={payslip.daysAbsent}
                    className="border-l-4 border-l-red-500"
                  />
                )}
                {payslip.employmentType === "irregular" && (
                  <>
                    <StatCard
                      icon={Clock}
                      label="Total Hours"
                      value={`${payslip.totalHours} hrs`}
                    />
                    <StatCard
                      icon={DollarSign}
                      label="Rate / Hour"
                      value={formatCurrency(payslip.ratePerHour)}
                    />
                  </>
                )}
                {payslip.employmentType === "regular" && (
                  <StatCard
                    icon={DollarSign}
                    label="Monthly Rate"
                    value={formatCurrency(payslip.ratePerMonth)}
                  />
                )}
                <StatCard
                  icon={TrendingUp}
                  label="Gross Income"
                  value={formatCurrency(payslip.grossIncome)}
                />
              </div>

              {/* Bonuses Table */}
              {payslip.bonuses?.length > 0 && (
                <div className="mb-8">
                  <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-green-600" />
                    Bonuses & Additional Income
                  </h2>
                  <div className="bg-gray-50 rounded-lg overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="text-left p-4 font-semibold text-gray-700">Bonus Type</th>
                          <th className="text-right p-4 font-semibold text-gray-700">Amount</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                         {payslip.bonuses.map((b, i) => (
                          <tr key={i} className="hover:bg-white">
                            <td className="p-4 text-gray-800">{b.label}</td>
                            <td className="p-4 text-right text-gray-800">{formatCurrency(b.amount)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Deductions Table */}
                <div className="mb-8">
                  <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Calculator className="w-5 h-5 text-red-600" />
                    Deductions
                  </h2>
                  <div className="bg-gray-50 rounded-lg overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="text-left p-4 font-semibold text-gray-700">Deduction Type</th>
                          <th className="text-right p-4 font-semibold text-gray-700">Amount</th>
                          <th className="text-right p-4 font-semibold text-gray-700">Remaining Balance</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {payslip.deductions?.length > 0 ? (
                          <>
                            {payslip.deductions.map((d, i) => (
                              <tr key={i} className="hover:bg-white">
                                <td className="p-4 text-gray-800">{d.label}</td>
                                <td className="p-4 text-right text-gray-800">{formatCurrency(d.amount)}</td>
                                <td className="p-4 text-right text-gray-800">
                                  {d.balance !== undefined ? formatCurrency(d.balance) : 'N/A'}
                                </td>
                              </tr>
                            ))}
                            <tr className="font-bold bg-white">
                              <td className="p-4 text-gray-900">Total Deductions</td>
                              <td className="p-4 text-right text-gray-900">
                                {formatCurrency(payslip.deductions.reduce((sum, d) => sum + d.amount, 0))}
                              </td>
                              <td></td>
                            </tr>
                          </>
                        ) : (
                          <tr>
                            <td colSpan={3} className="p-4 text-center text-gray-500">No deductions this period</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              {/* Net Pay */}
                <div className="mb-8">
                  <div className="bg-blue-50 rounded-lg overflow-hidden">
                    <table className="w-full">
                      <tbody>
                        <tr className="bg-blue-50 font-bold text-lg">
                          <td className="p-4 text-gray-900">NET PAY</td>
                          <td className="p-4 text-right text-blue-700">{formatCurrency(payslip.netPay)}</td>
                          <td></td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              {/* Actions and Insights for Single Payslip */}
              <div className="mt-8 flex flex-col gap-4">
                <div className="flex justify-center">
                  <button
                    onClick={handlePrint}
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-3 rounded-lg font-semibold flex items-center gap-2 shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    <Download className="w-5 h-5" />
                    Print Payslip
                  </button>
                </div>

                <InsightsPanel 
                  generatingInsights={generatingInsights}
                  insights={insights}
                  selectedPeriods={selectedPeriods}
                  payslip={payslip}
                  summaryReport={summaryReport}
                  getPayslipInsights={getPayslipInsights}
                  setInsights={setInsights}
                />
              </div>
            </div>
          </div>
        )}
                {/* Summary Report View */}
        {summaryReport && selectedPeriods.length > 1 && (
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold mb-1">{summaryReport.fullName}</h1>
                  <p className="text-indigo-100 flex items-center gap-2">
                    <Building className="w-4 h-4" />
                    {summaryReport.employmentType.charAt(0).toUpperCase() + summaryReport.employmentType.slice(1)} Employee | Grade {summaryReport.salaryGrade}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-indigo-100 text-sm">Total Net Pay</p>
                  <p className="text-3xl font-bold">
                    {formatCurrency(
                      Object.values(summaryReport.periodSummary || {}).reduce((sum, data) => sum + data.net_income, 0)
                    )}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6">
              {/* Monthly Summary */}
              <div className="mb-8">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-600" />
                  Period Summary
                </h2>
                <div className="bg-gray-50 rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="text-left p-4 font-semibold text-gray-700">Period</th>
                        <th className="text-right p-4 font-semibold text-gray-700">Income</th>
                        <th className="text-right p-4 font-semibold text-gray-700">Deductions</th>
                        <th className="text-right p-4 font-semibold text-gray-700">Net Pay</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {Object.entries(summaryReport.periodSummary || {}).map(([period, data]) => (
                        <tr key={period} className="hover:bg-white transition-colors">
                          <td className="p-4 font-medium text-gray-900">{period}</td>
                          <td className="p-4 text-right font-semibold text-green-600">{formatCurrency(data.gross_income)}</td>
                          <td className="p-4 text-right font-semibold text-red-600">{formatCurrency(data.total_deductions)}</td>
                          <td className="p-4 text-right font-semibold text-blue-600">{formatCurrency(data.net_income)}</td>
                        </tr>
                      ))}
                      <tr className="bg-blue-50 font-bold text-lg">
                        <td className="p-4 text-gray-900">TOTAL</td>
                        <td className="p-4 text-right text-green-700">
                          {formatCurrency(
                            Object.values(summaryReport.periodSummary || {}).reduce((sum, data) => sum + data.gross_income, 0)
                          )}
                        </td>
                        <td className="p-4 text-right text-red-700">
                          {formatCurrency(
                            Object.values(summaryReport.periodSummary || {}).reduce((sum, data) => sum + data.total_deductions, 0)
                          )}
                        </td>
                        <td className="p-4 text-right text-blue-700">
                          {formatCurrency(
                            Object.values(summaryReport.periodSummary || {}).reduce((sum, data) => sum + data.net_income, 0)
                          )}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Income Breakdown */}
              <div className="mb-8">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                  Income Breakdown
                </h2>
                <div className="bg-gray-50 rounded-lg overflow-hidden overflow-x-auto">
                  <table className="w-full min-w-max">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="text-left p-4 font-semibold text-gray-700 sticky left-0 bg-gray-100">Income Type</th>
                        {Object.keys(summaryReport.periodSummary || {}).map(period => (
                          <th key={`income-${period}`} className="text-right p-4 font-semibold text-gray-700 min-w-[120px]">
                            {period}
                          </th>
                        ))}
                        <th className="text-right p-4 font-semibold text-gray-700 min-w-[120px]">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {Object.entries(summaryReport.incomeBreakdown).map(([incomeType, amounts]) => (
                        <tr key={incomeType} className="hover:bg-white transition-colors">
                          <td className="p-4 font-medium text-gray-900 sticky left-0 bg-gray-50">{incomeType}</td>
                          {Object.keys(summaryReport.periodSummary || {}).map(period => (
                            <td key={`${incomeType}-${period}`} className="p-4 text-right">
                              {amounts[period] ? (
                                <span className="font-semibold text-green-600">{formatCurrency(amounts[period])}</span>
                              ) : (
                                <span className="text-gray-400">-</span>
                              )}
                            </td>
                          ))}
                          <td className="p-4 text-right font-bold text-green-700">
                            {formatCurrency(Object.values(amounts).reduce((sum, amount) => sum + amount, 0))}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              
              {/* Deduction Breakdown */}
              <div className="mb-8">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Calculator className="w-5 h-5 text-red-600" />
                  Deduction Breakdown
                </h2>
                <div className="bg-gray-50 rounded-lg overflow-hidden overflow-x-auto">
                  <table className="w-full min-w-max">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="text-left p-4 font-semibold text-gray-700 sticky left-0 bg-gray-100">Deduction Type</th>
                        {Object.keys(summaryReport.periodSummary || {}).map(period => (
                          <th key={`deduction-${period}`} className="text-right p-4 font-semibold text-gray-700 min-w-[120px]">
                            {period}
                          </th>
                        ))}
                        <th className="text-right p-4 font-semibold text-gray-700">Total</th>
                        <th className="text-right p-4 font-semibold text-gray-700">Current Balance</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {Object.entries(summaryReport.deductionBreakdown)
                        .filter(([key]) => !key.endsWith('_balance'))
                        .map(([deductionType, amounts]) => {
                          const balanceKey = `${deductionType}_balance`;
                          const lastPeriod = summaryReport.periods?.slice(-1)[0] || '';
                          const balance = summaryReport.deductionBreakdown[balanceKey]?.[lastPeriod] || 0;
                          
                          return (
                            <tr key={deductionType} className="hover:bg-white transition-colors">
                              <td className="p-4 font-medium text-gray-900 sticky left-0 bg-gray-50">{deductionType}</td>
                              {Object.keys(summaryReport.periodSummary || {}).map(period => (
                                <td key={`${deductionType}-${period}`} className="p-4 text-right">
                                  {amounts[period] ? (
                                    <span className="font-semibold text-red-600">
                                      {formatCurrency(amounts[period])}
                                    </span>
                                  ) : (
                                    <span className="text-gray-400">-</span>
                                  )}
                                </td>
                              ))}
                              <td className="p-4 text-right font-bold text-red-700">
                                {formatCurrency(
                                  Object.values(amounts).reduce((sum, amount) => sum + amount, 0)
                                )}
                              </td>
                              <td className="p-4 text-right font-medium text-gray-600">
                                {formatCurrency(balance)}
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Action Button and Insights */}
              <div className="flex flex-col gap-4">
                <div className="flex justify-center">
                  <button
                    onClick={handlePrint}
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-3 rounded-lg font-semibold flex items-center gap-2 shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    <Download className="w-5 h-5" />
                    Print Summary Report
                  </button>
                </div>
                
                <InsightsPanel 
                  generatingInsights={generatingInsights}
                  insights={insights}
                  selectedPeriods={selectedPeriods}
                  payslip={payslip}
                  summaryReport={summaryReport}
                  getPayslipInsights={getPayslipInsights}
                  setInsights={setInsights}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
    </div>
  );
};

export default ReportsPage;
