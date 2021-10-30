/**
 * (C) Copyright 2021 IBM Corporation.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// GQL - query data by inventory id to get location info and product info
var getLocationAndPartNumberByInventoryIdGQL = '{ \
  "query": "query Inventory($tenantId: String!, $inventoryId: String!) { \
    inventory: businessObjects( \
    simpleFilter: { tenantId: $tenantId, type: Inventory } \
    hint: { viewId: \\\"inventoryflow\\\" } \
    cursorParams: { first: 1 } \
    advancedFilter: { \
     AND: [ \
      { \
       EQUALS: [ \
        { SELECT: \\\"id\\\", type: STRING } \
        { VALUE: $inventoryId, type: STRING } \
       ] \
      } \
     ] \
    } \
    ) { \
      totalCount  \
      pageInfo { \
        hasNextPage \
        endCursor \
      } \
      edges { \
        cursor \
        object { \
          id \
          ... on Inventory { \
            location { \
              id  \
              locationName \
              city \
            } \
            product { \
              id \
              name \
              partNumber  \
              description \
            } \
          } \
        } \
      } \
    } \
  }", \
    "variables": {} \
  }';

// GQL - query inventory info by specific part number
var getInventoryByPartNumberGQL = '{ \
  "query":"query Inventory($tenantId: String!, $advancedFilter: BooleanExp!){ \
      inventory:businessObjects( \
      simpleFilter: { tenantId: $tenantId, type: Inventory } \
      hint: { viewId: \\\"inventoryflow\\\" } \
      cursorParams: { \
        first: 50  \
        sort:   { \
          fieldPath: \\\"quantityAboveUpperThreshold\\\", order: DESC \
        } \
      } \
      advancedFilter: $advancedFilter \
      ) { \
        totalCount \
        pageInfo { \
          hasNextPage  \
          endCursor \
        } \
        edges { \
          cursor \
          object { \
            id  \
            ... on Inventory { \
              location { \
                id \
                city \
                locationName \
              } \
              product { \
                partNumber \
                id \
              } \
              quantity \
              quantityUnits \
              quantityAboveUpperThreshold \
              value \
              valueCurrency \
              daysOfSupplyAboveUpperThreshold \
              shelfLife \
            } \
          } \
        } \
      } \
    }", \
  "variables": {}, \
  "operationName":"Inventory" \
}';

var additionalInfoName = 'WFID';

// record log message and list them in variable log
function writeLog(title, message) {
  if(!tw.local.logs) 
    tw.local.logs = new tw.object.listOf.toolkit.TWSYS.String();
  tw.local.logs[tw.local.logs.listLength] = title + ' : ' + message;
}

function writeError(errorDetail) {
  writeLog('error', errorDetail);
}

function isValidJson(json) {
  try {
    JSON.parse(json);
    return true;
  }
  catch (e) {
    return false;
  }
}
// initial payload for create new workitem
function getWorkItemCreateJsonString() {
  writeLog('operation', 'create new workitem');
  var body = {
    actionDefinition: {
      id: tw.local.workItem.businessObject.actionDefinition.id
    },
    additionalInfo: [
      {
        name: additionalInfoName,
        value: tw.system.currentProcessInstance.id
      }
    ],
    businessObject: {
      id: tw.local.workItem.businessObject.businessObject.id,
      type: tw.local.workItem.businessObject.businessObject.type
    },
    endDate: new Date(),
    id: '',
    priority: 0,
    relatedLinks: [],
    sourceId: tw.local.workItem.businessObject.sourceId,
    sourceType: tw.local.workItem.businessObject.sourceType,
    status: tw.local.currentStatus,
    tenantId: tw.local.workItem.businessObject.tenantId,
    userAssigned: tw.local.workItem.businessObject.userAssigned
  };
  tw.local.workItemBody = JSON.stringify(body);
  writeLog('workItemBody', tw.local.workItemBody);
}

// initial payload for update existing workitem
function getWorkItemUpdateJsonString() {
  writeLog('operation', 'update existing workitem');
  var body = {
    additionalInfo: [
      {
        name: additionalInfoName,
        value: tw.system.currentProcessInstance.id
      }
    ],
    status: tw.local.currentStatus,
    tenantId: tw.local.workItem.businessObject.tenantId
  };
  tw.local.workItemBody = JSON.stringify(body);
  writeLog('existing workitem id', tw.local.workItem.businessObject.id);
  writeLog('workItemBody', tw.local.workItemBody);
}

// get workitem id and set it to local variable
// set data to didUpdateWorkItem variable to show whether update successfully
function setUpWorkItemId() {
  writeLog('operation', 'set workitem id');
  try {
    writeLog('workItemOutput', tw.local.workItemOutput);
    var result = JSON.parse(tw.local.workItemOutput);
    if(!result.id)
      tw.local.didUpdateWorkItem = false;
    else {
      tw.local.workItem.businessObject.id = result.id;
      tw.local.didUpdateWorkItem = true;
    }
    writeLog('didUpdateWorkItem', tw.local.didUpdateWorkItem);
  }
  catch (e) {
    writeError('setUpWorkItemId');
  }
}

// set data to didUpdateWorkItem variable to show whether update successfully
function validUpdateWorkItem() {
  writeLog('operation', 'valid update workitem');
  try{
    var result = JSON.parse(tw.local.workItemOutput);
    if(!result.id)
      tw.local.didUpdateWorkItem = false;
    else
      tw.local.didUpdateWorkItem = true;
    writeLog('didUpdateWorkItem', tw.local.didUpdateWorkItem);
  }
  catch(e) {
    writeError('validUpdateWorkItem');
  }
}

// initialize GQL to get location and product info by specific inventory id
// set query variable to getLocationAndPartNumberByInventoryIdGQL
function getLocationAndPartNumberByInventoryId() {
  writeLog('operation', 'get location and product info');
  var queryObj = JSON.parse(getLocationAndPartNumberByInventoryIdGQL);
  queryObj.variables = {
    tenantId: tw.local.tenantId,
    inventoryId: tw.local.inventoryId
  };
  tw.local.queryLocationAndPartNumberGQL = JSON.stringify(queryObj);
  writeLog('queryLocationAndPartNumberGQL', tw.local.queryLocationAndPartNumberGQL);
}

// get location and product result and set them to requestForm
// set part number as query variable into getInventoryByPartNumberGQL for further query inventory info
function initializeQueryInventoryByPartNumberGQL() {
  writeLog('operation', 'get inventory info by part number');
  try{
    if (tw.local.queryLocationAndPartNumberGQLOutput) {
      writeLog('queryLocationAndPartNumberGQLOutput', tw.local.queryLocationAndPartNumberGQLOutput);
      if (isValidJson(tw.local.queryLocationAndPartNumberGQLOutput)) {
        var results = JSON.parse(tw.local.queryLocationAndPartNumberGQLOutput);
        var list = results.data.inventory.edges;
        var locationName = list[0].object.location.locationName;
        var partNumber = list[0].object.product.partNumber;
        var description = list[0].object.product.description;
        tw.local.requestForm = {};
        tw.local.requestForm.requestingLocation = locationName;
        tw.local.requestForm.productId = partNumber;
        tw.local.requestForm.productDescription = description;
        var queryObj = JSON.parse(getInventoryByPartNumberGQL);
        queryObj.variables = {
          tenantId: tw.local.tenantId,
          advancedFilter: {
            AND: [
              {
                GREATER_THAN: [
                  {
                    SELECT: 'quantityAboveUpperThreshold',
                    type: 'STRING'
                  },
                  {
                    VALUE: '0.0',
                    type: 'STRING'
                  }
                ]
              },
              {
                EQUALS: [
                  {
                    SELECT: 'inventoryType',
                    type: 'STRING'
                  },
                  {
                    type: 'STRING',
                    VALUE: 'PRODUCT'
                  }
                ]
              },
              {
                EQUALS: [
                  {
                    SELECT: 'product.partNumber',
                    type: 'STRING'
                  },
                  {
                    'VALUE': partNumber,
                    'type': 'STRING'
                  }
                ]
              }
            ]
          }
        };

        tw.local.queryInventoryGQL = JSON.stringify(queryObj);
        writeLog('queryInventoryGQL', tw.local.queryInventoryGQL);
      }
      else 
        writeError('query location and part number result is not a valid json');
    }
    else
      writeError('There is no inventory info matched with your part number.');
  }
  catch (e) {
    writeError(tw.local.queryLocationAndPartNumberGQLOutput);
    writeError(tw.local.queryInventoryGQL);
  }
}

// get query inventory info result
// also set them to requestForm to make it displayed as pre-populate data in request form
function initializeRequestForm() {
  try{
    writeLog('operation', 'initial request form');
    if (tw.local.queryInventoryGQLOutput) {
      writeLog('queryInventoryGQLOutput', tw.local.queryInventoryGQLOutput);
      if (isValidJson(tw.local.queryInventoryGQLOutput)) {
        tw.local.requestForm.requestorInfo = {};
        tw.local.requestForm.requestorInfo.name = tw.system.user.name;
        tw.local.requestForm.dateOfRequest = new Date(new Date().getTime());
        var results = JSON.parse(tw.local.queryInventoryGQLOutput);
        var list = results.data.inventory.edges; // inventory list
        // the transfer location should be a list
        var locationName = list[0].object.location.locationName;
        var quantityAboveUpperThresHold = list[0].object.quantityAboveUpperThreshold;
        tw.local.requestForm.transferFromLocation = locationName;
        tw.local.requestForm.quantityAvailable = quantityAboveUpperThresHold;
        writeLog('requestForm', JSON.stringify(tw.local.requestForm));
      }
      else 
        writeError('query inventory result is not a valid json');
    }
    else
      writeError('inventory result is null');
  }
  catch (e) {
    writeError(tw.local.queryInventoryGQLOutput);
    writeError(JSON.stringify(tw.local.requestForm));
  }
}

// following content only added in git repo file, pls remove it on workflow js file
module.exports = {
  initializeRequestForm,
  writeLog,
  getLocationAndPartNumberByInventoryId,
  initializeQueryInventoryByPartNumberGQL,
  getWorkItemCreateJsonString,
  getWorkItemUpdateJsonString,
  setUpWorkItemId,
  validUpdateWorkItem
};
