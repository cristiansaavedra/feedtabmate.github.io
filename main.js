import { 
   TableauViz
  ,TableauAuthoringViz
  ,TableauEventType 
  ,FilterType
} 
from 'https://public.tableau.com/javascripts/api/tableau.embedding.3.latest.js';

let global_variables = {isEditMode: false};

function handleFirstInteractive(e) {
  console.log(`Viz loaded: ${viz.src}`);
}

function renderViz(url, w, h) {

  if (url.indexOf(' ') >= 0){
    alert('Valid URL requiered');
  }
  else{
    // const guid = crypto.randomUUID();
    // console.log('The UUID is: ${guid}');
    // console.log(url);

    let viz;
    if (global_variables.isEditMode == true) {
      viz = new TableauAuthoringViz();
    }
    else{
      viz = new TableauViz();
    }

    viz.toolbar = 'hidden';
    viz.src = url;
    viz.hideTabs = false;    

    //Reset container
    let tableauContainer = document.getElementById('tableau-container')
    tableauContainer.style.width = w + "px";
    tableauContainer.style.height = h + "px";
    tableauContainer.replaceChildren();

    //adding new Viz
    try{
      tableauContainer.appendChild(viz);
    } catch (error) {
      console.error(error);
    }
  }
}

async function getInfo(){
  let output = document.getElementById("output");
  output.replaceChildren();

  let p = document.createElement("p");

  
  const vizView = document.querySelector('tableau-viz');
  const vizEdit = document.querySelector('tableau-authoring-viz');

  let viz;
  if (vizView != null){
    viz = vizView;
  }else{
    if (vizEdit != null){
      viz = vizEdit;
    }
  }
  
  if (viz == null) {
    alert('Load a valid Tableau URL');
  }
  else {

    viz.addEventListener(TableauEventType.FirstInteractive, handleFirstInteractive);

    try{
      //Name
      let wkb = viz.workbook;
      let p = document.createElement("p");
      p.innerHTML = '<h3><center>Dashboard name</center></h3><h2><center>' + wkb.name + '</center></h2>';
      output.append(p);
    } catch (error) {
      console.error(error);
    }

    try{
      //Active Sheet
      let activeSheet = viz.workbook.activeSheet;
      let p = document.createElement("p");
      p.innerHTML = '<br><h3><center>Active sheet</center></h3><h2><center>' + activeSheet.name + '</center></h2><br/>';
      output.append(p);
    } catch (error) {
      console.error(error);
    }
  
    try{
      //Paramters
      let p = document.createElement("p");
      const parameters = await viz.workbook.getParametersAsync();

      let text = '<h3>There are '+ parameters.length +' paramter(s)</h3><ol>';
      
      parameters.forEach((p) => {
        text += '<li><b>'+p.name+'</b> set to "' + p.currentValue.value + '"</li>'
      });

      p.innerHTML = text + '</ol>'
      output.append(p);
    } catch (error) {
      console.error(error);
    }

    try{
      //Filters
      let activeSheet = viz.workbook.activeSheet;
      const sheetFilters = await activeSheet.getFiltersAsync();
      
      let p = document.createElement("p");
      let text = '<h3>There are '+ sheetFilters.length +' applied filter(s) or actions accross {numworkbooks} workbooks.</h3><ol>'

      let countWorkbooks = 0;
      let previousWorksheetName = '';

       sheetFilters.forEach((s) => {

        //Categorical Filters
        if (s.filterType === FilterType.Categorical) {

          if (previousWorksheetName != s.worksheetName){
              countWorkbooks += 1;
              text += '</ol><p>For worksheet <b>'+s.worksheetName+'</b><p><ol>'
          }

          text += '<li><b>'+s.fieldName+'</b> of type '+s.filterType

          if (s.isAllSelected){
            text += ' set to <b>All</b></li>'
          }
          else{

            text += ' set to the value(s)</li><ol>'

            s.appliedValues.forEach((v) => {
              text += '<li>'+v.value +'</li>'
            })

            text += '</ol>'
          }

          previousWorksheetName = s.worksheetName;
        }


        //Range Number Filters
        if (s.filterType === FilterType.Range) {

          if (previousWorksheetName != s.worksheetName){
              countWorkbooks += 1;
              text += '</ol><p>For worksheet <b>'+s.worksheetName+'</b><p><ol>'
          }

          text += '<li><b>'+s.fieldName+'</b> of type '+s.filterType

          if (s.includeNullValues){
            text += ' including nulls values '
          }
          
          text += ' with min value of '+ s.minValue.value +' and max value of '+ s.maxValue.value +' </li><ol>'

          previousWorksheetName = s.worksheetName;
        }


        //Relativ Date Filters
        if (s.filterType === FilterType.RelativeDate) {

          if (previousWorksheetName != s.worksheetName){
              countWorkbooks += 1;
              text += '</ol><p>For worksheet <b>'+s.worksheetName+'</b><p><ol>'
          }

          text += '<li><b>'+s.fieldName+'</b> of type '+s.filterType
          
          text += ' with period type of <b>'+ s.periodType +'</b> and range N of <b>'+ s.rangeN +'</b> </li><ol>'

          previousWorksheetName = s.worksheetName;
        }

      });

      p.innerHTML = text.replace('{numworkbooks}',countWorkbooks)
      output.append(p);

    } catch (error) {
      console.error(error);
    }

  }

}

//Handler for formulary
let submit = document.getElementById("inputForm");
submit.addEventListener("submit", (e) => {
  e.preventDefault();

  let url = document.getElementById("inputURL");
  let width = document.getElementById("inputWidth");
  let height = document.getElementById("inputHeight");
  
  // console.log("url:" + url.value);
  // console.log("width:" + width.value);
  // console.log("height:" + height.value);

  renderViz(url.value, width.value, height.value);
});



//Handler Get information
let screen = document.getElementById("bt_getInformation");
screen.addEventListener("click", async (e) => {
  e.preventDefault();

  getInfo();
});



//Handler Edit
let mode = document.getElementById("bt_mode");
mode.addEventListener("click", async (e) => {
  e.preventDefault();

  console.log('Mode:' + global_variables.isEditMode);

  global_variables.isEditMode = !global_variables.isEditMode;

  if (global_variables.isEditMode == true) {
    mode.innerHTML = "View";
  }
  else{
    mode.innerHTML = "Edit";
  }


  let url = document.getElementById("inputURL");
  let width = document.getElementById("inputWidth");
  let height = document.getElementById("inputHeight");
  
  renderViz(url.value, width.value, height.value);
});
