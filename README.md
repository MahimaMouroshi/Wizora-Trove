# Wizora Trove Backend
  # Wizora Trove

Express + MongoDB API for Wizora Trove. This is the backend foundation for the Store, Trove Library, memberships, rentals, Request a Book, ratings, Decutler, Restoration, Blind Date, profiles and admin panel.

## Run locally

1. Install Node.js 20+.
2. Copy `.env.example` to `.env` and fill values.
3. `npm install`
4. `npm run seed:admin`
5. `npm run dev`

Health check: `GET /api/health`

## API groups

- `/api/auth`
- `/api/profile`
- `/api/library`
- `/api/requests`
- `/api/ratings`
- `/api/decutler`
- `/api/restoration`
- `/api/orders`
- `/api/blind-date`
- `/api/membership`
- `/api/admin`

## Important production notes

- Connect a real payment gateway before treating membership paymentStatus as paid automatically.
- Add transactional email for request confirmations, due dates and availability notices.
- Add image storage (Cloudinary/S3/etc.) rather than storing image binaries in MongoDB.
- Review privacy, refund, deposit and damaged/lost-book policies before launch.
- Use a strong JWT secret and production CORS origin.
