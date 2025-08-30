# CTV Rollup Application - User Manual

## Welcome to CTV Rollup

The CTV Rollup Application is your comprehensive solution for analyzing Connected TV (CTV) delivery logs. This user manual will guide you through all the features and help you get the most out of the system.

## Table of Contents

1. [Getting Started](#getting-started)
2. [Dashboard Overview](#dashboard-overview)
3. [Campaign Management](#campaign-management)
4. [Data Upload](#data-upload)
5. [Viewing Reports](#viewing-reports)
6. [Data Export](#data-export)
7. [Data Normalization](#data-normalization)
8. [Troubleshooting](#troubleshooting)
9. [Best Practices](#best-practices)

## Getting Started

### First Time Setup

1. **Access the Application**
   - Open your web browser
   - Navigate to: `http://localhost:3000`
   - You'll see the main dashboard

2. **System Requirements**
   - Modern web browser (Chrome, Firefox, Safari, Edge)
   - CSV files with CTV delivery data
   - Required columns: Content Title, Content Network Name, Impression, Quartile100

### Understanding the Interface

The application has three main sections:
- **Dashboard**: Overview and quick actions
- **Campaigns**: Manage your data uploads and campaigns
- **Normalize**: Set up data mapping rules

## Dashboard Overview

### What You'll See

The dashboard provides a comprehensive overview of your CTV data:

#### Quick Stats Cards
- **Total Campaigns**: Number of campaigns in your system
- **Total Impressions**: Combined impressions across all campaigns
- **Total Completes**: Combined video completions across all campaigns
- **Overall VCR**: Average video completion rate across all campaigns

#### Action Cards
- **Manage Campaigns**: Quick access to campaign management
- **Normalize Data**: Access to data mapping tools
- **View Reports**: Navigate to campaign reports

#### Recent Campaigns
- Shows your 5 most recent campaigns
- Quick access to view reports for each campaign
- Creation dates for reference

### Navigating the Dashboard

- **Click any stat card** to see more details
- **Use action buttons** to navigate to different sections
- **Recent campaigns list** provides quick access to reports

## Campaign Management

### Accessing Campaigns

1. **From Dashboard**: Click "Go to Campaigns" button
2. **From Navigation**: Click "Campaigns" in the top menu
3. **Direct URL**: Navigate to `/campaigns`

### Campaign List View

The campaigns page shows:
- **Campaign Name**: Human-readable campaign identifier
- **Status**: Active/Inactive status badge
- **Creation Date**: When the campaign was added
- **Actions**: View Reports button for each campaign

### Campaign Information

Each campaign displays:
- **Campaign ID**: Unique system identifier
- **Campaign Name**: Your custom campaign name
- **Created Date**: When the campaign was uploaded
- **Data Status**: Whether reports are available

## Data Upload

### Preparing Your Data

#### Required CSV Format

Your CSV file must contain these columns:
```csv
Campaign Name,Content Title,Content Network Name,Impression,Quartile100
My Campaign,Show Title,Netflix,1000,250
My Campaign,Another Show,Hulu,800,200
```

#### Column Descriptions

- **Campaign Name** (optional): Will be derived from filename if not provided
- **Content Title**: Name of the TV show, movie, or content piece
- **Content Network Name**: Platform or app name (e.g., Netflix, Hulu, FOX)
- **Impression**: Number of times the content was viewed
- **Quartile100**: Number of times the content was completed

#### Data Requirements

- **File Format**: CSV only
- **File Size**: Recommended under 100MB
- **Data Quality**: Clean, consistent naming for best results
- **Encoding**: UTF-8 recommended

### Uploading Data

#### Step-by-Step Process

1. **Navigate to Campaigns**
   - Go to `/campaigns` or click "Go to Campaigns" from dashboard

2. **Open Upload Form**
   - Click "Upload New Campaign" button
   - Upload form will appear below

3. **Configure Campaign**
   - **Campaign Name**: Enter custom name or leave blank to use filename
   - **File Selection**: Click "Choose File" and select your CSV

4. **Upload Data**
   - Click "Upload Campaign" button
   - Wait for processing to complete
   - Success message will appear

#### Upload Options

- **Campaign Name Override**: 
  - Leave blank to use filename (e.g., "Q4_Campaign.csv" becomes "Q4 Campaign")
  - Enter custom name for specific branding
  - Names are automatically cleaned and formatted

- **File Processing**:
  - System automatically detects CSV columns
  - Processes all rows with error handling
  - Shows processing summary after completion

### Upload Results

After successful upload, you'll see:
- **Campaign Created**: Confirmation with campaign ID
- **Processing Summary**: 
  - Rows processed
  - Rows successfully inserted
  - Any errors encountered
- **Sample Data**: First few rows for verification

## Viewing Reports

### Accessing Campaign Reports

1. **From Campaigns List**: Click "View Reports" button on any campaign
2. **From Dashboard**: Click on recent campaign in the list
3. **Direct URL**: Navigate to `/campaigns/{campaign-id}/reports`

### Report Interface

#### Summary Cards
- **Total Impressions**: Campaign-wide impression count
- **Total Completes**: Campaign-wide completion count
- **Overall VCR**: Campaign-wide video completion rate

#### Report Tabs

##### App Rollup Tab
Shows performance by content network/platform:
- **App Name**: Content network (Netflix, Hulu, etc.)
- **Impressions**: Total impressions for that network
- **Completes**: Total completions for that network
- **Avg VCR**: Average video completion rate
- **Content Count**: Number of unique content pieces

**Note**: Networks with less than 1,000 impressions are grouped into "Other" category for cleaner reporting.

##### Genre Rollup Tab
Shows performance by content genre:
- **Genre**: Content category (Action, Comedy, Drama, etc.)
- **Impressions**: Total impressions for that genre
- **Completes**: Total completions for that genre
- **Avg VCR**: Average video completion rate
- **Content Count**: Number of unique content pieces

##### Content Rollup Tab
Shows performance by individual content:
- **Content Title**: Name of specific show/movie
- **App Name**: Platform where content appeared
- **Impressions**: Total impressions for that content
- **Completes**: Total completions for that content
- **Avg VCR**: Video completion rate for that content

### Understanding the Data

#### VCR (Video Completion Rate)
- **Calculation**: (Completes ÷ Impressions) × 100
- **Interpretation**: Higher percentage = better viewer engagement
- **Example**: 25% means 1 in 4 viewers completed the video

#### Impression vs. Complete
- **Impression**: Content was viewed (started playing)
- **Complete**: Content was watched to the end
- **Relationship**: Completes are always ≤ Impressions

#### Data Aggregation
- **App Level**: All content under same network grouped together
- **Genre Level**: All content of same type grouped together
- **Content Level**: Individual content pieces shown separately

## Data Export

### Exporting Reports

#### Available Export Types
- **App Rollup**: Network/platform performance data
- **Genre Rollup**: Content genre performance data
- **Content Rollup**: Individual content performance data

#### Export Process

1. **Select Report Tab**: Choose the data view you want to export
2. **Click Export**: Use the "Export CSV" button
3. **Download**: File automatically downloads to your computer
4. **File Naming**: Format: `{CampaignName}-{type}-rollup.csv`

#### Export File Format

Exported CSV files contain:
- **Headers**: Clear column names
- **Data**: All rows from the selected report view
- **Formatting**: Numbers properly formatted with commas
- **Compatibility**: Works with Excel, Google Sheets, and other tools

### Using Exported Data

#### Common Use Cases
- **Presentations**: Import into PowerPoint or Google Slides
- **Further Analysis**: Use in Excel, Python, or R
- **Reporting**: Share with stakeholders or clients
- **Backup**: Keep local copies of your data

#### Data Manipulation
- **Sorting**: Sort by any column for analysis
- **Filtering**: Filter data by specific criteria
- **Charts**: Create visualizations from the data
- **Calculations**: Perform additional mathematical analysis

## Data Normalization

### What is Normalization?

Data normalization helps ensure consistent naming across your data:
- **Content Aliases**: Map similar content titles together
- **Genre Mapping**: Standardize genre classifications
- **Network Names**: Ensure consistent platform naming

### Accessing Normalization Tools

1. **From Dashboard**: Click "Manage Mappings" button
2. **From Navigation**: Click "Normalize" in top menu
3. **Direct URL**: Navigate to `/normalize`

### Setting Up Mappings

#### Content Aliases
- **Purpose**: Group similar content titles together
- **Example**: "The Office" and "Office, The" → "The Office"
- **Benefit**: More accurate content-level reporting

#### Genre Mapping
- **Purpose**: Standardize content categories
- **Example**: "Action" and "Action/Adventure" → "Action"
- **Benefit**: Consistent genre-based analysis

#### Network Names
- **Purpose**: Ensure consistent platform identification
- **Example**: "Netflix" and "NETFLIX" → "Netflix"
- **Benefit**: Accurate app-level rollup reporting

## Troubleshooting

### Common Issues

#### Upload Problems

**Issue**: "File upload failed"
- **Solution**: Check file format (must be CSV)
- **Solution**: Verify file size (under 100MB recommended)
- **Solution**: Ensure required columns are present

**Issue**: "Campaign creation failed"
- **Solution**: Check CSV format and column names
- **Solution**: Verify data in required columns
- **Solution**: Try with a smaller test file first

#### Data Display Issues

**Issue**: "No data showing in reports"
- **Solution**: Verify campaign was uploaded successfully
- **Solution**: Check that CSV contained valid data
- **Solution**: Refresh the page and try again

**Issue**: "Export not working"
- **Solution**: Ensure you're on the correct report tab
- **Solution**: Check browser download settings
- **Solution**: Try different browser if issue persists

#### Performance Issues

**Issue**: "Page loading slowly"
- **Solution**: Check file sizes (keep under 100MB)
- **Solution**: Close other browser tabs
- **Solution**: Refresh page if needed

### Getting Help

#### Error Messages
- **Read the full error message** for specific details
- **Check the console** (F12 → Console tab) for technical details
- **Note the steps** that led to the error

#### Support Information
- **Document the issue** with screenshots if possible
- **Note your browser** and operating system
- **Record the exact steps** that caused the problem

## Best Practices

### Data Preparation

#### CSV File Best Practices
- **Use consistent naming** for networks and content
- **Clean your data** before upload (remove duplicates, fix typos)
- **Standardize formats** (dates, numbers, text)
- **Test with small files** before uploading large datasets

#### Campaign Naming
- **Use descriptive names** that make sense to your team
- **Include date ranges** if relevant (e.g., "Q4_2025_Campaign")
- **Use consistent naming conventions** across campaigns
- **Avoid special characters** that might cause issues

### Data Management

#### Regular Maintenance
- **Review campaigns** regularly for accuracy
- **Export important data** for backup
- **Clean up old campaigns** if no longer needed
- **Update normalization rules** as needed

#### Data Quality
- **Validate data** before upload
- **Check for consistency** in naming conventions
- **Monitor for anomalies** in your reports
- **Document any data transformations** you perform

### Reporting Best Practices

#### Choosing the Right View
- **App Rollup**: Best for platform performance analysis
- **Genre Rollup**: Best for content strategy insights
- **Content Rollup**: Best for specific show/movie analysis

#### Interpreting Results
- **Compare similar campaigns** for benchmarking
- **Look for trends** over time
- **Identify outliers** that need investigation
- **Use multiple views** for comprehensive analysis

### System Usage

#### Performance Optimization
- **Upload during off-peak hours** for large files
- **Use consistent file formats** across campaigns
- **Keep file sizes reasonable** (under 100MB)
- **Close unused browser tabs** during heavy usage

#### Data Security
- **Export sensitive data** to secure locations
- **Don't share campaign IDs** publicly
- **Use secure connections** when accessing the system
- **Log out** when finished using the system

## Conclusion

The CTV Rollup Application provides powerful tools for analyzing your CTV delivery data. By following this user manual, you'll be able to:

- ✅ **Upload and manage campaigns** effectively
- ✅ **Generate comprehensive reports** for analysis
- ✅ **Export data** for further processing
- ✅ **Normalize data** for consistency
- ✅ **Troubleshoot issues** when they arise

Remember to start with small test files to familiarize yourself with the system, and don't hesitate to use the export features to keep local backups of your important data.

For the best experience, maintain consistent naming conventions and regularly review your data quality. The system is designed to handle your data efficiently and provide insights that help optimize your CTV campaigns.

---

**Manual Version**: 1.0  
**Last Updated**: August 29, 2025  
**Application Version**: CTV Rollup v0.1.0  
**Support**: Contact your system administrator for technical support
