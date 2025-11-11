import React from 'react'
import './Invoice.css'

const Invoice = () => {
  return (
    <div className="invoice-container">
      {/* Header */}
      <div className="invoice-header">
        <div>
          <h2>AL SUKOON GENERAL TRDG.CO.(L.L.C.)</h2>
          <p>P.O. Box: 2975 Ajman (U.A.E.)</p>
          <p>Tel: 06-7435725 &nbsp; Fax: 06-7437350</p>
          <p>Emirate: Ajman</p>
          <p>TRN: 100002073300003</p>
          <p>E-Mail: alsukoon1@gmail.com</p>
        </div>
        <div className="invoice-info">
          <p>
            Invoice No: <strong>284026</strong>
          </p>
          <p>
            Dated: <strong>17-Jul-2025</strong>
          </p>
        </div>
      </div>

      <h3 className="title">TAX INVOICEghjkghkjgkgk</h3>

      {/* Payment Info */}
      <table className="info-table">
        <tbody>
          <tr>
            <td>
              <strong>1- CASH ON Delivery</strong>
            </td>
            <td>Emirate: Ajman</td>
          </tr>
          <tr>
            <td>Delivery Note</td>
            <td>Place of Supply: Ajman, UAE</td>
          </tr>
          <tr>
            <td>Mode/Terms of Payment</td>
            <td></td>
          </tr>
        </tbody>
      </table>

      {/* Items Table */}
      <table className="items-table">
        <thead>
          <tr>
            <th>Sl.No</th>
            <th>Description of Goods</th>
            <th>Quantity</th>
            <th>Rate</th>
            <th>Per</th>
            <th>Disc %</th>
            <th>Amount</th>
            <th>VAT %</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>1</td>
            <td>
              Bucket Bolt 10x50
              <br />
              <small>VAT 5%</small>
            </td>
            <td>1.00 Pcs</td>
            <td>4.76</td>
            <td>Pcs</td>
            <td>5%</td>
            <td>4.76</td>
            <td>0.24</td>
          </tr>
          <tr>
            <td colSpan="8" className="total-row">
              Total: 1.00 Pcs &nbsp; &nbsp; 5.00
            </td>
          </tr>
        </tbody>
      </table>

      {/* Summary */}
      <div className="summary">
        <p>
          Amount Chargeable (in words): <strong>ARAB EMIRATES DIRHAM Five Only (AED 5.00)</strong>
        </p>
        <p>
          VAT Amount in words: <strong>Twenty Four Fils Only</strong>
        </p>
        <table>
          <tbody>
            <tr>
              <td>Sub Total</td>
              <td>4.76</td>
            </tr>
            <tr>
              <td>VAT 5%</td>
              <td>0.24</td>
            </tr>
            <tr>
              <td>
                <strong>NET Amount</strong>
              </td>
              <td>
                <strong>5.00</strong>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="footer">
        <p>
          <strong>Declaration:</strong> Received in Good condition
        </p>
        <div className="signatures">
          <div>
            <p>Prepared By</p>
            <p>_________________</p>
          </div>
          <div>
            <p>Verified By</p>
            <p>_________________</p>
          </div>
          <div>
            <p>Authorised Signatory</p>
            <p>_________________</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Invoice
