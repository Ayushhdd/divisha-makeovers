# Changing your admin login

1. Open https://divishamakeovers.com/portal/admin/login and sign in with your current admin details. This page has no registration option; registration creates customer accounts only.
2. In the admin sidebar, choose **Change Password**. The page is called **Change Admin Login**.
3. Enter your current password. Leave **Also change my login email** unchecked to keep your existing email. If you check it, enter a private email address whose inbox you control.
4. Choose your own unique password of at least 11 characters. A password manager can generate and store it. Do not send it in chat, put it in source code, or upload it to GitHub. Passwords cannot exceed 72 UTF-8 bytes because the database uses bcrypt.
5. Enter the new password again and click **Update Login & Sign Out**.
6. Sign in again with your chosen email and password. Every old login session has been invalidated. The old password no longer works.

The database stores a salted bcrypt hash of your password; it does not return the password in profile or admin responses. The new password is not written to repository files or hosting environment variables. Copying this repository does not include the live database or hosting secrets. Anyone with access to your computer, hosting account, database account, or recovery inbox is a separate risk; protect those accounts too.

`ADMIN_EMAIL` and `ADMIN_PASSWORD` are bootstrap values used only when the database has no admin account. They never reset an existing admin. After initialization, you can remove those two bootstrap environment variables from Render. A new empty database cannot create an admin without explicitly supplied values. There is no built-in default login.

Any old setup password saved locally is obsolete after this change. Update your own password manager and remove obsolete copies when you no longer need them. There is no need to send your new password to an agent or update it in Render.

If you forget the password, use **Forgot Password?** on the login page. The recovery code goes to the account's current email address. Keep control of that inbox. Resetting the password also signs out old sessions.

# Advance and installment receipts

Each payment screenshot waits for admin approval. Unapproved payments do not increase the verified paid amount. After approval, the customer's receipt shows the approved payments, total paid, and remaining balance. Later approved installments update that receipt. The customer opens **Appointments → View Receipt → Download / Print Receipt** to save it as a PDF using the browser's print dialog. A receipt is not automatically emailed.

Example: for a ₹10,000 booking, an approved ₹2,000 advance gives a ₹2,000 paid / ₹8,000 due receipt. Approving a second ₹3,000 payment updates it to ₹5,000 paid / ₹5,000 due. Approving the last ₹5,000 updates it to ₹10,000 paid / ₹0 due.
