/* (C) Copyright 2022 IBM Corporation.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at

  http://www.apache.org/licenses/LICENSE-2.0

 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
*/

const mockTW = require('./mock-tw.js');
const script = require('../../transfer-inventory.js');

describe('function getWorkItemCreateJsonString', () => {
  it('initial new workitem payload should with values', function() {
    script.getWorkItemCreateJsonString();
    let newWorkItem = JSON.parse(mockTW.local.workItemBody);
    expect(newWorkItem).toMatchObject({
      'actionsTaken': [
        {}    
      ],
      'businessObject': {
        'id': 'mockBusinessObjId',
        'type': 'Inventory'
      },
      'id': '',
      'priority': 0,
      'relatedLinks': [],
      'sourceId': 'mockSourceId',
      'sourceType': 'WorkQueueDefinition',
      'status': 'mockStatus',
      'tenantId': 'mockTenantId',
      'userAssigned': 'mockUser'
    });
  });
});

describe('function getWorkItemUpdateJsonString', () => {
  it('initial update workitem payload should with values', function() {
    script.getWorkItemUpdateJsonString();
    let updateWorkItem = JSON.parse(mockTW.local.workItemBody);
    expect(updateWorkItem).toMatchObject({
      'status': 'mockStatus',
      'tenantId': 'mockTenantId'
    });
  });
});

describe('function setUpWorkItemId', () => {
  it('workitem id should be set value when output has id', function() {
    script.setUpWorkItemId();
    let workItemId = mockTW.local.workItem.businessObject.id;
    let didUpdateWorkItemFlag = mockTW.local.didUpdateWorkItem;
    expect(workItemId).toBe('mockNewWorkItemId');
    expect(didUpdateWorkItemFlag).toBe(true);
  });

  it('didUpdateWorkItem flag should be false when output without id', function() {
    mockTW.local.workItemOutput = '{ \"test\": \"mockNewWorkItemId\" }';
    script.setUpWorkItemId();
    let didUpdateWorkItemFlag = mockTW.local.didUpdateWorkItem;
    expect(didUpdateWorkItemFlag).toBe(false);
  });

  it('should handle exception when output invalid', function() {
    mockTW.local.workItemOutput = '';
    script.setUpWorkItemId();
    expect(mockTW.local.logs[0]).toBe('error : setUpWorkItemId');
  });
});

describe('function validUpdateWorkItem', () => {
  it('didUpdateWorkItem flag should be true when output with id', function() {
    mockTW.local.workItemOutput = '{ \"id\": \"mockWorkItemId\" }';
    script.validUpdateWorkItem();
    let didUpdateWorkItemFlag = mockTW.local.didUpdateWorkItem;
    expect(didUpdateWorkItemFlag).toBe(true);
  });

  it('didUpdateWorkItem flag should be false when output without id', function() {
    mockTW.local.workItemOutput = '{ \"test\": \"mockNewWorkItemId\" }';
    script.validUpdateWorkItem();
    let didUpdateWorkItemFlag = mockTW.local.didUpdateWorkItem;
    expect(didUpdateWorkItemFlag).toBe(false);
  });

  it('should handle exception when output invalid', function() {
    mockTW.local.workItemOutput = '';
    script.validUpdateWorkItem();
    expect(mockTW.local.logs[0]).toBe
    ('error : validUpdateWorkItem:SyntaxError: Unexpected end of JSON input');
  });
});

describe('function getLocationAndPartNumberByInventoryId', () => {
  it('initial GQL should with variable values', function() {
    script.getLocationAndPartNumberByInventoryId();
    let GQL = JSON.parse(mockTW.local.queryLocationAndPartNumberGQL);
    expect(GQL.variables).toMatchObject({
      tenantId: 'mockTenantId',
      inventoryId: 'mockInventoryId'
    });
  });
});

describe('function initializeQueryInventoryByPartNumberGQL', () => {
  it('should request form has description value and GQL have variable values', function() {
    script.initializeQueryInventoryByPartNumberGQL();
    expect(mockTW.local.requestForm).toMatchObject({
      requestingLocation: 'mockLocationName',
      productId: 'mockPartNumber',
      productDescription: 'mockDesc'
    });
  });

  it('should print log when GQL query result is null', function() {
    mockTW.local.queryLocationAndPartNumberGQLOutput = null;
    script.initializeQueryInventoryByPartNumberGQL();
    expect(mockTW.local.logs[0]).
      toBe('error : There is no inventory info matched with your part number.');
  });

  it('should catch error when GQL query is not a valid json', function() {
    mockTW.local.queryLocationAndPartNumberGQLOutput = 'mockData';
    script.initializeQueryInventoryByPartNumberGQL();
    expect(mockTW.local.logs[0]).
      toBe('error : query location and part number result is not a valid json');
  });

  it('should catch error when GQL query result is invalid', function() {
    mockTW.local.queryLocationAndPartNumberGQLOutput = '{ \"query\": \"mockData\" }';
    script.initializeQueryInventoryByPartNumberGQL();
    expect(mockTW.local.logs[0]).
      toBe('error : ' + mockTW.local.queryInventoryGQL);
  });
});

describe('function initializeRequestForm', () => {
  it('should get request form info when GQL output is not null', function() {
    mockTW.local.requestForm = {
      quantityAvailable:'',
      transferFromLocation:''
    };
    script.initializeRequestForm();
    expect(mockTW.local.requestForm).toMatchObject({
      quantityAvailable: 'mockQuantity',
      transferFromLocation: 'mockLocationName',
      requestorInfo: { name: 'mockUserName' }
    });
  });

  it('should print log info when GQL output is null', function() {
    mockTW.local.queryInventoryGQLOutput = null;
    script.initializeRequestForm();
    expect(mockTW.local.logs[0]).toBe('error : inventory result is null');
  });

  it('should catch error when GQL output is not a valid json', function() {
    mockTW.local.queryInventoryGQLOutput = 'mockData';
    script.initializeRequestForm();
    expect(mockTW.local.logs[0])
      .toBe('error : query inventory result is not a valid json');
  });

  it('should catch error when GQL output is invalid', function() {
    mockTW.local.queryInventoryGQLOutput = '{ \"query\": \"mockData\" }';
    script.initializeRequestForm();
    expect(mockTW.local.logs[0])
      .toBe('error : ' + JSON.stringify(mockTW.local.requestForm));
  });

});

describe('function writeLog', () => {
  it('should write log info', function() {
    script.writeLog('title','message');
    expect(mockTW.local.logs[0]).toBe('title : message');
  });

  it('should initialize log list', function() {
    mockTW.local.logs = null;
    script.writeLog('title','message');
    expect(mockTW.local.logs).not.toEqual(null);
  });

});

describe('function getActionTakenCreateJsonString', () => {
  it('initial new actionTaken payload should with values', function() {
    script.getActionTakenCreateJsonString();
    let newActionTaken = JSON.parse(mockTW.local.actionTakenBody);
    expect(newActionTaken).toMatchObject({
      'actionDefinition': {
        'id': 'mockActionDefId'
      },
      'additionalInfo': [
        {
          'name': 'WFID',
          'value': 'mockCurrentProcess'
        }
      ],
      'status': 'mockStatus',
      'tenantId': 'mockTenantId',
      'userAssigned': 'mockUser'
    });
  });
});

describe('function getActionTakenUpdateJsonString', () => {
  it('initial actionTaken payload should with values', function() {
    script.getActionTakenUpdateJsonString();
    let newActionTaken = JSON.parse(mockTW.local.actionTakenBody);
    expect(newActionTaken).toMatchObject({
      'additionalInfo': [
        {
          'name': 'WFID',
          'value': 'mockCurrentProcess'
        }
      ],
      'status': 'mockStatus',
      'tenantId': 'mockTenantId'
    });
  });
});

describe('function getWorkItemStatusUpdateJsonString', () => {
  it('initial update workitem payload should with values', function() {
    script.getWorkItemStatusUpdateJsonString();
    let updateWorkItem = JSON.parse(mockTW.local.workItemBody);
    expect(updateWorkItem).toMatchObject({
      'status': 'mockStatus',
      'tenantId': 'mockTenantId'
    });
  });
});

describe('function validUpdateActionTaken', () => {
  it('didUpdateActionTaken flag should have value', function() {
    mockTW.local.logs = {
      listLength: 0
    };
    mockTW.local.actionTakenOutput = '{ \"id\": \"mockActionTakenId\" }';
    script.validUpdateActionTaken();
    expect(mockTW.local.logs[0]).toBe('didUpdateActionTaken : mockActionTakenId');
  });

  it('didUpdateActionTaken flag should be undefined', function() {
    mockTW.local.actionTakenOutput = '{ \"test\": \"mockNewWorkItemId\" }';
    script.validUpdateActionTaken();
    expect(mockTW.local.logs[0]).toBe('didUpdateActionTaken : undefined');
  });

  it('should handle exception when output invalid', function() {
    mockTW.local.actionTakenOutput = '';
    script.validUpdateActionTaken();
    expect(mockTW.local.logs[0]).toBe
    ('error : validUpdateActionTaken:SyntaxError: Unexpected end of JSON input');
  });
});
