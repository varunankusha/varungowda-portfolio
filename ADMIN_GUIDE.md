# Admin Guide - Adding Images, Videos, and Polls

## How to Access Admin Panel

1. Open your website in a browser
2. Scroll to the footer and click on "Admin" link
3. Enter the password: `neelamma`
4. You'll see the admin panel with two sections: Gallery and Polls

## Adding Images and Videos to Gallery

### Supported Formats:
- **Images**: JPG, PNG, GIF, WebP, SVG
- **Videos**: MP4, WebM, OGG
- **Embedded Videos**: YouTube, Vimeo

### Steps:
1. Select the type (Image or Video)
2. Enter the source URL:
   - For images: Direct link to the image file
   - For videos: Direct link to video file or YouTube/Vimeo URL
   - For YouTube: Use format like `https://www.youtube.com/watch?v=VIDEO_ID`
   - For Vimeo: Use format like `https://vimeo.com/VIDEO_ID`
3. Add an optional description/alt text
4. Click "Add to Gallery"
5. Click "Save & Update Site" to see changes on the main page

### Example URLs:
- Image: `https://example.com/image.jpg`
- Video: `https://example.com/video.mp4`
- YouTube: `https://www.youtube.com/watch?v=dQw4w9WgXcQ`
- Vimeo: `https://vimeo.com/123456789`

## Creating Polls

### Steps:
1. Enter your question in the "Question" field
2. Enter options separated by commas in the "Options" field
3. Click "Create Poll"
4. Click "Save & Update Site" to see the poll on the main page

### Example:
- Question: "What's your favorite programming language?"
- Options: `JavaScript, Python, Java, C++`

## Troubleshooting

### If you can't add items:
1. **Check the status message** at the top of the admin panel
2. **For Supabase errors**: Make sure your database is properly set up
3. **For localStorage**: The data will be saved in your browser only
4. **Check browser console** (F12) for detailed error messages

### Common Issues:
- **"No Supabase config found"**: The system will use localStorage instead
- **"Supabase error"**: Check your database connection and permissions
- **"Already voted"**: Users can only vote once per poll

### Database Setup:
If you're using Supabase, make sure to run the SQL schema in your Supabase SQL editor:
1. Go to your Supabase dashboard
2. Navigate to SQL Editor
3. Copy and paste the contents of `supabase/schema.sql`
4. Run the script

## Data Management

### Export/Import:
- Use "Export JSON" to download your current data
- Use "Import JSON" to restore data from a backup
- This works for both Supabase and localStorage data

### Clearing Data:
- "Clear Gallery" removes all gallery items
- "Clear Polls" removes all polls
- These actions cannot be undone

## Security Notes

- The admin password is hardcoded as `neelamma`
- For production use, consider implementing proper authentication
- The current setup allows anonymous writes to the database for simplicity
