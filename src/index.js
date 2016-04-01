/**
 * This is the boilerplate repository for creating joules.
 * Forking this repository should be the starting point when creating a joule.
 */

/*
 * The handler function for all API endpoints.
 * The `event` argument contains all input values.
 *    event.httpMethod, The HTTP method (GET, POST, PUT, etc)
 *    event.{pathParam}, Path parameters as defined in your .joule.yml
 *    event.{queryStringParam}, Query string parameters as defined in your .joule.yml
 */
var Response = require('joule-node-response');
var GoogleSpreadsheet = require("google-spreadsheet");

exports.handler = function(event, context) {
	var response = new Response();
  var doc = new GoogleSpreadsheet(event.query['key']);

	response.setContext(context);

  doc.getInfo(function(err, doc) {
    if(err) {
      response.setHttpStatusCode(400);
      response.send(err);
      return;
    }

    var currentWorksheet = doc.worksheets[0];

    currentWorksheet.getRows({offset: 0, limit: 1}, function(err, firstRow) {
      if(err) {
        response.setHttpStatusCode(400);
        response.send(err);
        return;
      }

      var columnCount = 0;
      for(var columnName in firstRow[0]) {
        switch(columnName) {
          case '_xml':
          case 'id':
          case '_links':
          case 'save':
          case 'del':
            break;
          default:
            columnCount++;
        }
      }
    });

    currentWorksheet.getCells({'return-empty': false}, function(err, cells) {
      var allCells = [];
      if(err) {
        response.setHttpStatusCode(400);
        response.send(err);
        return;
      }

      var cell, thisCol, thisRow, thisValue;
      for(var i in cells) {
        cell = cells[i];
        thisRow = cell.row - 1;
        thisCol = cell.col - 1;
        thisValue = cell._value;
        if(typeof(allCells[thisRow]) === 'undefined') {
          allCells[thisRow] = [];
        }
        allCells[thisRow][thisCol] = thisValue;
      }

      response.send(allCells);
    });
  });
};
