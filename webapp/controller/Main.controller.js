sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "../lib/FileSaver"
],
    function (Controller, Filter, FilterOperator, MessageToast, MessageBox, FileSaver) {
        "use strict";

        return Controller.extend("sync.ea.salesai.controller.Main", {
            onInit: function () {
            },


            onFilter: function () {
                var aFilters = [];
                var oTable = this.byId("dataTable");
                var oBinding = oTable.getBinding("items");

                var sTsdat = this.byId("tsdatFilter").getValue();
                var sAufnr = this.byId("aufnrFilter").getValue();
                var sCharg = this.byId("chargFilter").getValue();

                if (sTsdat) {
                    aFilters.push(new Filter("SvYear", FilterOperator.Contains, sTsdat));
                }
                if (sAufnr) {
                    aFilters.push(new Filter("Werks", FilterOperator.Contains, sAufnr));
                }
                if (sCharg) {
                    aFilters.push(new Filter("Matnr", FilterOperator.Contains, sCharg));
                }

                if (oBinding) {
                    oBinding.filter(aFilters);
                    console.log("Filters applied:", aFilters);
                } else {
                    console.error("Table binding not found");
                }
            },

            onClearFilters: function () {
                this.byId("aufnrFilter").setValue("");
                this.byId("chargFilter").setValue("");
                this.byId("tsdatFilter").setValue("");
                this.onFilter();
            },

            onCreateJsonModel: function () {
                var oTable = this.byId("dataTable");
                var oSelectedItem = oTable.getSelectedItem();
                            
                if (!oSelectedItem) {
                    MessageToast.show("선택된 라인이 없습니다.");
                    return;
                }
                            
                var oBindingContext = oSelectedItem.getBindingContext();
                var oData = oBindingContext.getProperty();
                var sYear = oData.SvYear;
                            
                var sMessage = "선택한 년도는 " + sYear + "이며, 모든 플랜트와 자재에 대한 판매실적 JSON 모델이 생성됩니다. \nJSON 모델을 생성하시겠습니까?";
                            
                MessageBox.confirm(sMessage, {
                    title: "JSON 모델 생성",
                    actions: [MessageBox.Action.YES, MessageBox.Action.NO],
                    onClose: function (oAction) {
                        if (oAction === MessageBox.Action.YES) {
                            var sUrl = "/sap/opu/odata/SAP/ZEA_SD010_SRV/SDT010Set?$format=json";
                            
                            // AJAX 요청을 사용하여 데이터를 가져옵니다.
                            $.ajax({
                                url: sUrl,
                                method: "GET",
                                success: function (oResponse) {
                                    var aResults = oResponse.d.results;
                                    var oModelData = {};
                            
                                    // 받은 데이터를 기반으로 JSON 모델을 만듭니다.
                                    aResults.forEach(function (oEntry) {
                                        var sKey = oEntry.Werks + "-" + oEntry.Matnr; // 플랜트와 자재를 결합하여 고유 키 생성
                                        oModelData[sKey] = oEntry; // 플랜트와 자재에 대한 데이터를 JSON 모델에 추가
                                    });
                            
                                    // 만든 JSON 모델을 로컬 스토리지에 저장합니다.
                                    var sLocalStorageKey = "jsonModel_" + sYear;
                                    localStorage.setItem(sLocalStorageKey, JSON.stringify(oModelData));
            
                                    // 가져온 JSON 데이터를 텍스트 파일로 저장합니다.
                                    var sJsonData = JSON.stringify(oModelData);
                                    var sFileName = "json_data_" + sYear + ".txt";
                                    var oBlob = new Blob([sJsonData], { type: "text/plain;charset=utf-8" });
                                    saveAs(oBlob, sFileName);
                            
                                    // 모델이 성공적으로 생성되었음을 사용자에게 알립니다.
                                    MessageToast.show("JSON 모델이 생성되었습니다. \n로컬 스토리지 및 로컬에 텍스트 파일이 저장되었습니다.");
                                },
                                error: function (jqXHR, textStatus, errorThrown) {
                                    MessageToast.show("데이터를 가져오는 중 오류가 발생했습니다.");
                                    console.error("Error:", textStatus, errorThrown);
                                }
                            });
                        }
                    }
                });
            }
            
            
            
            
        });
    });