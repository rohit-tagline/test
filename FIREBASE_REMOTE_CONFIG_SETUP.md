# Firebase Remote Config Setup Guide

## Overview
Firebase Remote Config allows you to change the behavior and appearance of your app without publishing an app update. This guide will help you set up Remote Config for your React Native app.

## Step 1: Enable Remote Config in Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. In the left sidebar, click on **"Remote Config"** (under Engage section)
4. If prompted, click **"Get Started"** to enable Remote Config

## Step 2: Add Parameters

In the Remote Config dashboard, click **"Add parameter"** and add the following parameters:

### Parameter 1: `welcomeMessage`
- **Key**: `welcomeMessage`
- **Data type**: String
- **Default value**: `Welcome to the App!`
- **Description**: Welcome message displayed to users

### Parameter 2: `appVersion`
- **Key**: `appVersion`
- **Data type**: String
- **Default value**: `1.0.0`
- **Description**: Current app version

### Parameter 3: `featureEnabled`
- **Key**: `featureEnabled`
- **Data type**: Boolean
- **Default value**: `false`
- **Description**: Enable/disable a feature

### Parameter 4: `maxRetries`
- **Key**: `maxRetries`
- **Data type**: Number
- **Default value**: `3`
- **Description**: Maximum number of retry attempts

### Parameter 5: `apiEndpoint`
- **Key**: `apiEndpoint`
- **Data type**: String
- **Default value**: `https://api.example.com`
- **Description**: API endpoint URL

### Parameter 6: `discountPercentage`
- **Key**: `discountPercentage`
- **Data type**: Number
- **Default value**: `10`
- **Description**: Discount percentage for promotions

## Step 3: Publish Changes

1. After adding all parameters, click **"Publish changes"** button
2. Review your changes in the confirmation dialog
3. Click **"Publish"** to make them live

## Step 4: Test in Your App

1. Open the Remote Config screen in your app
2. Click **"Fetch Config (Cached)"** to fetch with cache (respects cache expiration)
3. Click **"Fetch Config (Force)"** to force fetch from server (ignores cache)
4. You should see the values you set in Firebase Console

## Advanced: Conditional Values

You can set different values based on conditions:

1. Click on a parameter
2. Click **"Add value for condition"**
3. Create a condition (e.g., based on app version, user properties, etc.)
4. Set different values for different conditions

### Example Conditions:
- **App version**: Show different features for different app versions
- **User properties**: Show different content for different user segments
- **Platform**: Different values for iOS vs Android
- **Country**: Localized content based on country

## Best Practices

1. **Set Default Values**: Always set default values in your code (already done in RemoteConfigScreen.js)
2. **Cache Expiration**: Use appropriate cache expiration times (default is 3600 seconds = 1 hour)
3. **Fetch on App Start**: Fetch config when app starts (already implemented in useEffect)
4. **Handle Errors**: Always handle fetch errors gracefully
5. **Test Thoroughly**: Test with different parameter values before publishing

## How It Works

1. **Fetch**: Retrieves config from Firebase (respects cache if not expired)
2. **Activate**: Makes the fetched values available in your app
3. **Get Values**: Use `remoteConfig().getValue('key')` to get values
4. **Type Conversion**: Use `.asString()`, `.asNumber()`, `.asBoolean()` for type conversion

## Troubleshooting

### Values not updating?
- Make sure you clicked "Publish changes" in Firebase Console
- Try using "Force" fetch to bypass cache
- Check your internet connection

### Getting default values only?
- Verify parameter keys match exactly (case-sensitive)
- Check Firebase Console to ensure parameters are published
- Verify Firebase project is correctly configured

### Error messages?
- Check Firebase setup (google-services.json for Android)
- Verify Remote Config is enabled in Firebase Console
- Check network connectivity

## Next Steps

- Add more parameters as needed
- Set up conditional values for A/B testing
- Implement feature flags using Remote Config
- Use Remote Config for dynamic content updates

