# Cyber Security Dashboard

Cyber Security Dashboard for my Master's Thesis at TUM

## Data Input

Beware that you will need to get your data from somewhere if you want to have a useful dashboard.

The data is provided by an function that looks like this:

```javascript
function getData() {
    return 'month,total,attack1,attack2\n' +
    'Jan 2016,7,5,2\n' +
    'Feb 2016,3,3,0\n';
}
```

If there is no data source available, dummy data is used instead.
