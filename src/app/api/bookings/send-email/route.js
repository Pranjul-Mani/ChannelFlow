// For Pages Router: /pages/api/booking/send-email.js
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransporter({
    service: 'gmail', // or your email service
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
    },
});

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        const { bookingId, guestEmail, bookingDetails } = req.body;

        if (!guestEmail) {
            return res.status(400).json({
                success: false,
                message: 'Guest email is required'
            });
        }

        const emailContent = generateEmailContent(bookingDetails);

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: guestEmail,
            subject: `Booking Confirmation - ${bookingDetails.bookingId || 'Your Reservation'}`,
            html: emailContent,
        };

        await transporter.sendMail(mailOptions);

        res.status(200).json({
            success: true,
            message: 'Email sent successfully'
        });
    } catch (error) {
        console.error('Error sending email:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to send email'
        });
    }
}

function generateEmailContent(booking) {
    const dates = getBookingDates(booking);
    const primaryGuestName = getPrimaryGuestName(booking);

    return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.4; color: #333; max-width: 600px; margin: 0 auto; font-size: 13px; }
        .voucher-header { border: 3px solid black; padding: 15px; margin-bottom: 20px; }
        .header-content { display: flex; justify-content: space-between; align-items: flex-start; }
        .left-section { flex: 1; }
        .right-section { text-align: right; }
        .content { padding: 15px; }
        .booking-details { background-color: #f8f9fa; padding: 12px; border-radius: 6px; margin: 15px 0; }
        .policies-section { background-color: #fff8dc; border: 2px solid #daa520; padding: 15px; border-radius: 6px; margin: 15px 0; }
        .policy-header { font-size: 18px; font-weight: bold; text-align: center; margin-bottom: 15px; color: #8b4513; text-decoration: underline; }
        .policy-subsection { margin-bottom: 12px; }
        .policy-title { font-weight: bold; font-size: 14px; margin-bottom: 6px; color: #8b4513; }
        .policy-content { margin-left: 10px; font-size: 12px; }
        .policy-content ol { margin-left: 15px; margin-bottom: 8px; }
        .policy-content li { margin-bottom: 4px; }
        .policy-content p { margin-bottom: 6px; }
        .hotel-times { background-color: #e8f4f8; padding: 10px; border: 1px solid #b3d9e6; margin: 10px 0; border-radius: 4px; text-align: center; font-size: 12px; }
        .footer { background-color: #6c757d; color: white; padding: 12px; text-align: center; font-size: 12px; }
        .highlight { background-color: #e3f2fd; padding: 8px; border-left: 4px solid #2196f3; margin: 8px 0; }
        .contact-info { text-align: center; font-size: 11px; color: #8b4513; line-height: 1.3; }
        .two-column { display: flex; gap: 15px; }
        .column { flex: 1; }
        .info-row { display: flex; justify-content: space-between; margin-bottom: 6px; padding: 4px 0; }
      </style>
    </head>
    <body>
      <!-- Voucher Header - Exact Format -->
      <div class="voucher-header">
        <div class="header-content">
          <div class="left-section">
            <h1 style="margin: 0 0 8px 0; font-size: 24px; font-weight: bold;">CONFIRM BOOKING</h1>
            <h2 style="margin: 0 0 8px 0; font-size: 16px; font-weight: 600;">BOOKING REFERENCE NO :</h2>
            <h2 style="margin: 0 0 15px 0; font-size: 20px; font-weight: bold;">${booking.bookingId || '{request_number}'}</h2>
            <div style="font-size: 13px;">
              <p style="margin: 0;">Kindly print this confirmation and have it</p>
              <p style="margin: 0;">ready upon check-in at the Hotel</p>
            </div>
          </div>
          <div class="right-section">
            <h1 style="margin: 0 0 8px 0; font-size: 24px; font-weight: bold;">Hotel Moksha</h1>
            <div style="font-size: 11px; line-height: 1.3;">
              <p style="margin: 0;">Near Geeta Ashram Taxi Stand, Swargashram, Rishikesh,</p>
              <p style="margin: 0;">Dehradun, Uttarakhand, 249304,</p>
              <p style="margin: 0 0 8px 0;">Rishikesh - 249304,Uttarakhand,India</p>
              <p style="margin: 0;">bookings@hotelmoksha.in</p>
              <p style="margin: 0;">Phone : +91 135 244 0040</p>
            </div>
          </div>
        </div>
      </div>
      
      <div class="content">
        <p style="margin: 0 0 8px 0;">Dear ${primaryGuestName},</p>
        <br>
        <p style="margin-bottom: 15px;">Thank you for choosing Hotel Moksha for your stay. We are pleased to inform you that your reservation request is CONFIRMED and your reservation details are as follows.</p>
        
        <div class="booking-details">
          <h3 style="margin: 0 0 12px 0; font-size: 16px;">Booking Details</h3>
          <div class="two-column">
            <div class="column">
              <div class="info-row">
                <span><strong>Booking Date:</strong></span>
                <span>${new Date().toLocaleDateString()}</span>
              </div>
              <div class="info-row">
                <span><strong>Check In Date:</strong></span>
                <span>${dates.formattedCheckIn.date}</span>
              </div>
              <div class="info-row">
                <span><strong>Check Out Date:</strong></span>
                <span>${dates.formattedCheckOut.date}</span>
              </div>
              <div class="info-row">
                <span><strong>Nights:</strong></span>
                <span>${booking.bookingSummary?.duration || 'N/A'}</span>
              </div>
              <div class="info-row">
                <span><strong>Arrival Time:</strong></span>
                <span>1:00 PM</span>
              </div>
            </div>
            <div class="column">
              <div class="info-row">
                <span><strong>Total Guests:</strong></span>
                <span>${booking.guestInformation?.totalGuests || 0}</span>
              </div>
              <div class="info-row">
                <span><strong>Total Rooms:</strong></span>
                <span>${booking.bookingSummary?.totalRooms || 0}</span>
              </div>
              <div class="info-row">
                <span><strong>Status:</strong></span>
                <span>CONFIRMED</span>
              </div>
            </div>
          </div>
          <div class="highlight">
            <p style="margin: 0; text-align: center;"><strong>TOTAL AMOUNT: ₹${(booking.totalAmount || 0).toLocaleString()}</strong></p>
          </div>
        </div>

        <div class="policies-section">
          <div class="policy-header">Conditions & Policies</div>
          
          <div class="policy-subsection">
            <div class="policy-title">Cancellation Policy</div>
            <div class="policy-content">
              <p>Cancellation is allowed up to Three days prior to the check-in date.</p>
            </div>
          </div>

          <div class="policy-subsection">
            <div class="policy-title">Hotel Policy</div>
            <div class="policy-content">
              <p><strong>Late Check-Out Policy</strong></p>
              <p>At Hotel Moksha, We strive to accommodate our guests needs and ensure a comfortable stay. Our standard check-out time is 11:00 am, and check-in time is 1:00 pm.</p>
              
              <p><strong>Late Check-Out Guidelines:</strong></p>
              <ol>
                <li><strong>Complimentary Late Check-Out (Up to 1 Hour):</strong> Guests may request a late check-out of up to 1 hour beyond the standard check-out time. This is subject to prior intimation and confirmation from the hotel and will only be granted if the room has not been pre-booked for an incoming guest.</li>
                <li><strong>Extended Late Check-Out Charges:</strong>
                  <br>More than 1 hour and up to 2 hours : ₹500
                  <br>More than 2 hours and up to 3 hours : ₹1000  
                  <br>More than 3 hours: Charged as half day's tariff
                </li>
              </ol>
              
              <p><strong>Important Notes:</strong> Late check-out requests are subject to availability and must be confirmed by the front desk in advance. Charges will be applied automatically if the room is occupied beyond the permitted time without prior confirmation. We recommend informing the front desk as early as possible to facilitate your request. For any assistance or inquiries regarding late check-out, please contact our reception desk.</p>
              
              <p>Thank you for choosing Hotel Moksha. We hope you enjoy your stay!</p>
            </div>
          </div>

          <div class="hotel-times">
            <strong>Hotel Check in Time : 11:00 AM</strong><br>
            <strong>Hotel Check out Time : 11:00 AM</strong>
          </div>

          <div class="contact-info">
            <p style="margin-bottom: 6px;">This email has been sent from an automated system - please do not reply to it.</p>
            <p style="margin-bottom: 6px;"><strong>**** FOR ANY FURTHER QUERY ****</strong></p>
            <p style="margin-bottom: 4px;"><strong>Contact us by Email Id:</strong> bookings@hotelmoksha.in</p>
            <p style="margin-bottom: 4px;"><strong>Phone NO:</strong> +91 135 244 0040</p>
            <p style="margin: 0;"><strong>Address:</strong> Near Geeta Ashram Taxi Stand, Swargashram, Rishikesh, Dehradun, Uttarakhand, 249304, Rishikesh-249304, Uttarakhand, India</p>
          </div>
        </div>
      </div>

      <div class="footer">
        <p style="margin: 0;">&copy; 2025 Hotel Moksha. All rights reserved.</p>
      </div>
    </body>
    </html>
  `;
}

