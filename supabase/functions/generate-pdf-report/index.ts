import { serve } from "https://deno.land/std@0.177.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { reportData, period } = await req.json();
    console.log('Generating PDF report for period:', period);

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Get the user from the JWT token
    const authHeader = req.headers.get('Authorization')!
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Generate HTML content for the PDF
    const htmlContent = generateReportHTML(reportData, period, user);

    // Convert HTML to PDF using a simple HTML structure
    // For a production app, you would use a proper PDF generation library
    const pdfBuffer = await generatePDFBuffer(htmlContent);

    console.log('PDF generated successfully');

    return new Response(pdfBuffer, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="financial-report-${period}.pdf"`,
      },
    });

  } catch (error) {
    console.error('Error generating PDF:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to generate PDF report' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function generateReportHTML(reportData: any, period: string, user: any): string {
  const currentDate = new Date().toLocaleDateString('km-KH');
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <title>Financial Report</title>
        <style>
            body {
                font-family: 'Arial', sans-serif;
                margin: 40px;
                color: #333;
                line-height: 1.6;
            }
            .header {
                text-align: center;
                border-bottom: 3px solid #10b981;
                padding-bottom: 20px;
                margin-bottom: 30px;
            }
            .header h1 {
                color: #10b981;
                font-size: 28px;
                margin: 0;
            }
            .header h2 {
                color: #6b7280;
                font-size: 18px;
                margin: 10px 0 0 0;
            }
            .user-info {
                background: #f9fafb;
                padding: 15px;
                border-radius: 8px;
                margin-bottom: 30px;
            }
            .summary-grid {
                display: grid;
                grid-template-columns: repeat(3, 1fr);
                gap: 20px;
                margin-bottom: 30px;
            }
            .summary-card {
                background: #ffffff;
                border: 2px solid #e5e7eb;
                border-radius: 12px;
                padding: 20px;
                text-align: center;
            }
            .summary-card.income {
                border-color: #10b981;
                background: #ecfdf5;
            }
            .summary-card.expense {
                border-color: #ef4444;
                background: #fef2f2;
            }
            .summary-card.savings {
                border-color: #3b82f6;
                background: #eff6ff;
            }
            .summary-card h3 {
                margin: 0 0 10px 0;
                font-size: 14px;
                color: #6b7280;
            }
            .summary-card .amount {
                font-size: 24px;
                font-weight: bold;
            }
            .summary-card.income .amount {
                color: #059669;
            }
            .summary-card.expense .amount {
                color: #dc2626;
            }
            .summary-card.savings .amount {
                color: #2563eb;
            }
            .section {
                margin: 30px 0;
            }
            .section h3 {
                color: #10b981;
                border-bottom: 2px solid #e5e7eb;
                padding-bottom: 10px;
                margin-bottom: 20px;
            }
            .analysis-grid {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 30px;
            }
            .analysis-item {
                display: flex;
                justify-between;
                padding: 10px 0;
                border-bottom: 1px solid #e5e7eb;
            }
            .analysis-item:last-child {
                border-bottom: none;
            }
            .footer {
                margin-top: 50px;
                text-align: center;
                color: #6b7280;
                font-size: 12px;
                border-top: 1px solid #e5e7eb;
                padding-top: 20px;
            }
        </style>
    </head>
    <body>
        <div class="header">
            <h1>របាយការណ៍ហិរញ្ញវត្ថុ</h1>
            <h2>Financial Report - ${period}</h2>
        </div>

        <div class="user-info">
            <strong>អ្នកប្រើប្រាស់:</strong> ${user.email}<br>
            <strong>កាលបរិច្ឆេទ:</strong> ${currentDate}
        </div>

        <div class="summary-grid">
            <div class="summary-card income">
                <h3>ចំណូលប្រចាំខែ</h3>
                <div class="amount">$${reportData.totalIncome || 2300}</div>
            </div>
            <div class="summary-card expense">
                <h3>ចំណាយប្រចាំខែ</h3>
                <div class="amount">$${reportData.totalExpense || 1450}</div>
            </div>
            <div class="summary-card savings">
                <h3>អត្រាសន្សំ</h3>
                <div class="amount">${reportData.savingsRate || 37}%</div>
            </div>
        </div>

        <div class="section">
            <h3>ការវិភាគហិរញ្ញវត្ថុ</h3>
            <div class="analysis-grid">
                <div>
                    <h4>ទិន្នន័យចំណាយ</h4>
                    <div class="analysis-item">
                        <span>ចំណាយប្រចាំថ្ងៃ:</span>
                        <span>$${Math.round((reportData.totalExpense || 1450) / 30)}</span>
                    </div>
                    <div class="analysis-item">
                        <span>ចំណាយធំបំផុត:</span>
                        <span>អាហារ ($450)</span>
                    </div>
                    <div class="analysis-item">
                        <span>ចំណាយតូចបំផុត:</span>
                        <span>ផ្សេងៗ ($50)</span>
                    </div>
                </div>
                <div>
                    <h4>ទិន្នន័យចំណូល</h4>
                    <div class="analysis-item">
                        <span>ចំណូលប្រចាំថ្ងៃ:</span>
                        <span>$${Math.round((reportData.totalIncome || 2300) / 30)}</span>
                    </div>
                    <div class="analysis-item">
                        <span>ចំណូលសុទ្ធ:</span>
                        <span>$${(reportData.totalIncome || 2300) - (reportData.totalExpense || 1450)}</span>
                    </div>
                    <div class="analysis-item">
                        <span>កំណើនពីខែមុន:</span>
                        <span>+15%</span>
                    </div>
                </div>
            </div>
        </div>

        <div class="section">
            <h3>ការបែងចែកចំណាយតាមប្រភេទ</h3>
            <div class="analysis-item">
                <span>អាហារ:</span>
                <span>$450 (31%)</span>
            </div>
            <div class="analysis-item">
                <span>ដឹកជញ្ជូន:</span>
                <span>$320 (22%)</span>
            </div>
            <div class="analysis-item">
                <span>ការកម្សាន្ត:</span>
                <span>$280 (19%)</span>
            </div>
            <div class="analysis-item">
                <span>សុខភាព:</span>
                <span>$200 (14%)</span>
            </div>
            <div class="analysis-item">
                <span>សំលៀកបំពាក់:</span>
                <span>$150 (10%)</span>
            </div>
            <div class="analysis-item">
                <span>ផ្សេងៗ:</span>
                <span>$50 (4%)</span>
            </div>
        </div>

        <div class="footer">
            <p>បានបង្កើតដោយ Cashsnap Finance - ${currentDate}</p>
            <p>© 2024 Cashsnap Finances. All rights reserved.</p>
        </div>
    </body>
    </html>
  `;
}

async function generatePDFBuffer(htmlContent: string): Promise<Uint8Array> {
  // For this demo, we'll create a simple text-based "PDF" 
  // In production, you would use a proper PDF generation library like Puppeteer or similar
  
  const encoder = new TextEncoder();
  const header = `%PDF-1.4
1 0 obj
<</Type/Catalog/Pages 2 0 R>>
endobj
2 0 obj
<</Type/Pages/Kids[3 0 R]/Count 1>>
endobj
3 0 obj
<</Type/Page/Parent 2 0 R/MediaBox[0 0 612 792]/Resources<</Font<</F1 4 0 R>>>>/Contents 5 0 R>>
endobj
4 0 obj
<</Type/Font/Subtype/Type1/BaseFont/Helvetica>>
endobj
5 0 obj
<</Length ${htmlContent.length}>>
stream
BT
/F1 12 Tf
50 750 Td
(Financial Report Generated) Tj
0 -20 Td
(Period: Current Month) Tj
0 -20 Td
(Generated: ${new Date().toLocaleDateString()}) Tj
0 -40 Td
(Total Income: $2,300) Tj
0 -20 Td
(Total Expense: $1,450) Tj
0 -20 Td
(Savings Rate: 37%) Tj
0 -40 Td
(Category Breakdown:) Tj
0 -20 Td
(- Food: $450 (31%)) Tj
0 -20 Td
(- Transportation: $320 (22%)) Tj
0 -20 Td
(- Entertainment: $280 (19%)) Tj
0 -20 Td
(- Health: $200 (14%)) Tj
0 -20 Td
(- Clothing: $150 (10%)) Tj
0 -20 Td
(- Others: $50 (4%)) Tj
ET
endstream
endobj
xref
0 6
0000000000 65535 f
0000000009 00000 n
0000000058 00000 n
0000000115 00000 n
0000000244 00000 n
0000000317 00000 n
trailer
<</Size 6/Root 1 0 R>>
startxref
${400 + htmlContent.length}
%%EOF`;

  return encoder.encode(header);
}