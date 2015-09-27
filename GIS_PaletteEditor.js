/* ************************************************************************** *
 *   Copyright © 2015       Pavel Solovyev (solovyev.p.a@gmail.com)           *
 *                          Sergey Sevryukov (sevrukovs@gmail.com)            *
 *                          Alexander Afonin (acer737@yandex.ru)              *
 *                                                                            *
 *   Licensed under the Apache License, Version 2.0 (the "License");          *
 *   you may not use this file except in compliance with the License.         *
 *   You may obtain a copy of the License at                                  *
 *               http://www.apache.org/licenses/LICENSE-2.0                   *
 *                                                                            *
 *   Unless required by applicable law or agreed to in writing, software      *
 *   distributed under the License is distributed on an "AS IS" BASIS,        *
 *   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. *
 *   See the License for the specific language governing permissions and      *
 *   limitations under the License.                                           *
 *  ************************************************************************* */
 
/* ************************************************************************** *
 *              Current version of the Palette Editor: v0.1                   *
 *  ************************************************************************* */

function PaletteEditor(){
    // Default DOM element in which the palette editor's grid is generated
    this.default_grid_dom   = "palette-editor-container";
    this.actual_grid_dom    = null;
    // Default style for the palette editor's grid cell
    this.default_grid_class = "palette-editor-cell";
    // Default starting color for the palette editor's grid cell
    // Colors are stored this way and in a separate attribute, because some
    // browsers convert #RRGGBB into color names (e.g. #FF0000 -> 'red').
    this.default_grid_color = "rgb(255, 255, 255)";
    // Holds the name of the function to be called when a grid cell is clicked
    // Unfortunately, this is necessary for the generated grid to work...
    this.grid_cell_onclick  = null;
    // Palette Editor's current version
    this.version            = 0.1;
    
    // Return the current version of the Palette Editor
    this.getVersion = function(){
        return "GIS Palette Editor, version " + this.version;
    };
    
    // Set the name of the function to be called when a grid cell is clicked.
    // * f_name     -> name of the function to be called when a grid cell is clicked
    this.setGridCellOnclickFunction = function(f_name){
        this.grid_cell_onclick = f_name;
    };
    
    // This method generates 16 x 16 grid that the palette editor works with.
    // * target_dom -> id of the DOM element in which the grid will be generated
    // * css_class  -> css class defining the style of the grid's cells
    this.generateGrid = function(target_dom, css_class){
        // Check, whether the supplied target DOM element's id is null or empty
        // or the supplied string contains only whitespaces; if it is so, use
        // default DOM element id.
        if (target_dom === undefined || target_dom === null || target_dom.match(/^\s*$/)){
            this.actual_grid_dom = this.default_grid_dom;
        }
        else{
            this.actual_grid_dom = target_dom;
        }
        // Check, whether the supplied css class name is null or empty or the
        // supplied string contains only whitespaces; if it is so, use default
        // css class name.
        if (css_class === undefined || css_class === null || css_class.match(/^\s*$/)){
            css_class = this.default_grid_class;
        }
        // White is the default grid cell color.
        var bkg_color = this.default_grid_color;
        // ids of the grid cells are in the range of [1; 256].
        var cell_id = 1;
        // Get the target DOM element.
        var target = document.getElementById(this.actual_grid_dom);
        // Check, whether this DOM element actually exists in the document;
        // if it doesn't - alert the user and abort the creation of the grid.
        if (target === null){
            window.alert('ERROR: no DOM element with id="' + this.actual_grid_dom + '" was found!');
            return;
        }
        // Check, whether a function to be called when a grid cell is clicked is specified
        if (this.grid_cell_onclick === null){
            window.alert("ERROR: function to be called when a grid cell is clicked isn't specified!");
            return;
        }
        for (var i = 0; i < 16; i++){
            for (var j = 0; j < 16; j++){
                // Create a grid cell DOM element.
                var div = document.createElement('div');
                div.setAttribute('id', 'palette-grid-cell-' + cell_id);
                div.setAttribute('title', cell_id);
                div.setAttribute('class', css_class);
                div.setAttribute('style', 'background:' + bkg_color + ';');
                div.setAttribute('color', bkg_color);
                div.setAttribute('onclick', this.grid_cell_onclick + '(' + cell_id + ');');
                // Append the grid cell DOM element to the document.
                target.appendChild(div);
                cell_id++;
            }
            // Create and append <br/> DOM element at the end of the grid cells row.
            var br = document.createElement('br');
            target.appendChild(br);
        }
    };
    
    // Gets the color of the palette editor's grid cell.
    // * cell_id    -> id of the targeted grid cell
    // * format     -> the format in which the color is returned; can be either 'hex' or 'rgb'
    //                 * hex -> #RRGGBB; default
    //                 * rgb -> rgb(R, G, B)
    this.getGridCellColor = function(cell_id, format){
        // Check, whether the supplied color format is accepted by the system;
        // if it is not, default it to 'hex' (#RRGGBB)
        if (format === undefined || format === null || format !== 'rgb'){
            format = 'hex';
        }
        // Check, whether the supplied cell_id is within the accepted range;
        // if it is not, default it to the edge values of the grid cell id range.
        if (cell_id < 1){ cell_id = 1; }
        if (cell_id > 256){ cell_id = 256; }
        // Get the current color of the targeted cell
        var color = document.getElementById('palette-grid-cell-' + cell_id).getAttribute('color');
        if (format === 'rgb'){ return color; }
        // transform rgb(R, G, B) representation of a color into #RRGGBB one
        var color_components = color.substring(4, color.length - 1).split(',');
        color = this.convertToHex(color_components);
        return color;
    };
    
    // Sets the color of the palette editor's grid cell.
    // * cell_id    -> id of the targeted grid cell
    // * color      -> new color for the targeted grid cell
    // * format     -> the format of the color; can be either 'hex' or 'rgb'
    //                 * hex -> #RRGGBB; default
    //                 * rgb -> rgb(R, G, B)
    this.setGridCellColor = function(cell_id, color, format){
        // Check, in which format the color is supplied; if it is neither 'hex'
        // not 'rgb', assume we're dealing with 'hex'.
        if (format === undefined || format === null || format !== 'rgb'){
            format = 'hex';
        }
        // Check, whether the supplied cell_id is within the accepted range;
        // if it is not, default it to the edge values of the grid cell id range.
        if (cell_id < 1){ cell_id = 1; }
        if (cell_id > 256){ cell_id = 256; }
        // if color is in 'hex' format, transform it into 'rgb' string
        if (format === 'hex'){
            color = this.convertToRGBstring(color);
        }
        var cell = document.getElementById('palette-grid-cell-' + cell_id);
        cell.setAttribute('color', color);
        cell.setAttribute('style', 'background:' + color + ';');
    };
    
    // Gradient fill of the grid cells.
    // * low        -> lower edge of the range that needs to be filled
    // * high       -> upper edge of the range that needs to be filled
    this.applyGradientFill = function(low, high){
        var dist = high - low;
        // Check if there is any need to actually perform gradient fill.
        if (dist < 2){ return; }
        // Get the colors.
        var color_string_low = document.getElementById('palette-grid-cell-' + low).getAttribute('color');
        var color_components_low = color_string_low.substring(4, color_string_low.length - 1).split(',');
        var color_string_high = document.getElementById('palette-grid-cell-' + high).getAttribute('color');
        var color_components_high = color_string_high.substring(4, color_string_high.length - 1).split(',');
        // Variables needed to perform the gradiend fill:
        var r, g, b, rgb;
        for (var j = 1; j < dist; j++){
            r = parseInt(color_components_low[0]) + parseInt((parseInt(color_components_high[0]) - parseInt(color_components_low[0])) * (j / dist));
            g = parseInt(color_components_low[1]) + parseInt((parseInt(color_components_high[1]) - parseInt(color_components_low[1])) * (j / dist));
            b = parseInt(color_components_low[2]) + parseInt((parseInt(color_components_high[2]) - parseInt(color_components_low[2])) * (j / dist));
            rgb = 'rgb(' + r + ',' + g + ',' + b + ')';
            document.getElementById('palette-grid-cell-' + (low + j)).setAttribute('color', rgb);
            document.getElementById('palette-grid-cell-' + (low + j)).setAttribute('style', 'background:' + rgb + ';');
        }
    };
    
    // Flood fill of the grid cells.
    // * low        -> lower edge of the range that needs to be filled
    // * high       -> upper edge of the range that needs to be filled
    // * c_source   -> id of the grid cell, the color of which will be used for the flood fill
    this.applyFloodFill = function(low, high, c_source){        
        var color = document.getElementById('palette-grid-cell-' + c_source).getAttribute('color');
        for (var j = low; j <= high; j++){
            document.getElementById('palette-grid-cell-' + j).setAttribute('color', color);
            document.getElementById('palette-grid-cell-' + j).setAttribute('style', 'background:' + color + ';');
        }
    };
    
    // Resets all cells of the palette editor grid to the default color.
    this.resetPaletteEditorGrid = function(){
        for (var i = 1; i <= 256; i++){
            document.getElementById('palette-grid-cell-' + i).setAttribute('color', this.default_grid_color);
            document.getElementById('palette-grid-cell-' + i).setAttribute('style', 'background:' + this.default_grid_color + ';');
        }
    };
    
    // Imports a palette from an IDRISI palette file.
    // * input      -> id of the file input
    this.importIDRISIPaletteFile = function(input){
        // Check, whether the browser can read files
        if (!(window.File && window.FileReader && window.FileList && window.Blob)){
            window.alert("This browser doesn't support File API!");
            return;
        }
        // Get the file in the input
        var fileInput = document.getElementById(input);
        var file = fileInput.files[0];
        // Check, whether there IS a file
        if (file === undefined || file === null){
            window.alert('No file to import!');
            return;
        }
        // Check, whether the file has SMP extension
        if (!file.name.match(/.*\.(smp|SMP|Smp)/gi)){
            window.alert("The selected file isn't an SMP file!");
            return;
        }
        // Check the file size; IDRISI SMP palette file is exactly 786 bytes long
        if (file.size !== 786){
            window.alert("The selected file isn't an IDRISI palette!");
            return;
        }        
        // Create the file reader
        var reader = new FileReader();
        reader.onload = (function(theFile){
            return function(e){
                // Read the contents of the file
                var text = atob(e.target.result.substring(e.target.result.indexOf(',') + 1));
                // Final check, whether this is an IDRISI palette file
                if (text.substring(1, 7) !== 'IDRISI'){
                    window.alert("The selected file isn't an IDRISI palette!");
                    return;
                }
                var r, g, b, color;
                // First 18 bytes of the file are the header
                for (var i = 0; i < 256; i++){
                    // Read the color of a cell
                    r = text[i * 3 + 18].charCodeAt(0);
                    g = text[i * 3 + 19].charCodeAt(0);
                    b = text[i * 3 + 20].charCodeAt(0);
                    color = 'rgb(' + r + ',' + g + ',' + b + ')';
                    // Apply the color
                    document.getElementById('palette-grid-cell-' + (i + 1)).setAttribute('color', color);
                    document.getElementById('palette-grid-cell-' + (i + 1)).setAttribute('style', 'background:' + color + ';');
                }
            };
        })(file);
        reader.readAsDataURL(file);
    };
    
    // Exports the created palette as IDRISI Palette file (*.smp)
    // WARNING: In its current realization, the export doesn't work in IE.
    this.exportToIDRISIPalette = function(){
        // [IRDISI] raster palette 'header'
        var IDRISI = [0x5b, 0x49, 0x44, 0x52, 0x49, 0x53, 0x49, 0x5d, 0x01,
                      0x0a, 0x08, 0x12, 0xff, 0x00, 0x00, 0x00, 0xff, 0x00];
        // get the grid cell values
        var color_string, color_components;
        var buffer = new ArrayBuffer(786);
        var byteView = new Uint8Array(buffer);
        // fill in the IDRISI header
        for (var i = 0; i < 18; i++){
            byteView[i] = IDRISI[i];
        }
        for (var i = 0; i < 256; i++){
            color_string = document.getElementById('palette-grid-cell-' + (i + 1)).getAttribute('color');
            color_components = color_string.substring(4, color_string.length - 1).split(',');
            byteView[i * 3 + 18] = color_components[0] & 0xff;
            byteView[i * 3 + 19] = color_components[1] & 0xff;
            byteView[i * 3 + 20] = color_components[2] & 0xff;
        }
        var filetext = "";
        for (var i = 0; i < 786; i++){
            filetext += String.fromCharCode(byteView[i]);
        }
        var b64file = btoa(filetext);
        var data = 'data:application/octet-stream;base64,' + b64file;
        // Create a temporarily link (hidden) to make file download possible.
        var dllink = document.createElement('a');
        dllink.setAttribute('id', 'palette-export-dllink');
        dllink.setAttribute('download', 'palette.smp');
        dllink.setAttribute('href', data);
        dllink.setAttribute('style', 'display:none;');
        var target = document.getElementById(this.actual_grid_dom);
        target.appendChild(dllink);
        // Prompt file download
        dllink.click();
        // Remove the now-unnecessary link
        document.getElementById('palette-export-dllink').remove();
    };
    
    // Generated an #RRGGBB color code.
    // * red        -> red component value
    // * green      -> green component value
    // * blue       -> blue component value
    this.convertToHex = function(red, green, blue){
        var color = '#';
        red = parseInt(red).toString(16);
        if (red.length === 1){ red = '0' + red;}
        green = parseInt(green).toString(16);
        if (green.length === 1){ green = '0' + green;}
        blue = parseInt(blue).toString(16);
        if (blue.length === 1){ blue = '0' + blue;}
        color += red + green + blue;
        return color;
    };
    
    // Generated an #RRGGBB color code.
    // * rgb_array  -> an array that holds the values of red, green and blue
    //                 components of the color
    this.convertToHex = function(rgb_array){
        var color = '#';
        var red = parseInt(rgb_array[0]).toString(16);
        if (red.length === 1){ red = '0' + red;}
        var green = parseInt(rgb_array[1]).toString(16);
        if (green.length === 1){ green = '0' + green;}
        var blue = parseInt(rgb_array[2]).toString(16);
        if (blue.length === 1){ blue = '0' + blue;}
        color += red + green + blue;
        return color;
    };
    
    // Generated a "rgb(red, green, blue)" string from the #RRGGBB color code.
    // * hex        -> #RRGGBB color code
    this.convertToRGBstring = function(hex){
        var red = parseInt('0x' + hex.substring(1, 3));
        var green = parseInt('0x' + hex.substring(3, 5));
        var blue = parseInt('0x' + hex.substring(5, 7));
        var color = 'rgb(' + red + ',' + green + ',' + blue + ')';
        return color;
    };
}
