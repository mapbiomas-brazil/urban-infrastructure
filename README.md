<div class="fluid-row" id="header">
    <div id="column">
        <div class = "blocks">
            <img src='./assets/terras.svg' height='auto' width='165' align='right'>
        </div>
    </div>
    <h1 class="title toc-ignore">Urban Infrastructure</h1>
    <h4 class="author"><em>Terras App Solutions</em></h4>
</div>

## About

## How to use
### 1. Prepare environment.
#### 1.1. You need to create a GEE repository in the code editor and upload the modules in it.
```
Example:
users/terras/index_lib.js

```
### 2. Start classification.
#### 2.1. Start processing the classification_batch_l5_l7.js script (for the years 1985 - 2013)
```
Example:
users/terras/classification_batch_l5_l7.js

```
#### 2.2. Start processing the classification_batch_l8.js script (for the years 2013 - 2019)
```
Example:
users/terras/classification_batch_l8.js

```
### 3. Start spatial filter.
```
Example:
users/terras/spatial_filter.js

```
### 4. Start temporal filter.
```
Example:
users/terras/temporal_filter_batch.js

```