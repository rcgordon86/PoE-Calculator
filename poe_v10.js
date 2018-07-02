        $(document).ready( function() { 
            window.resizeTo(1200, 800);
            var KwireR = 0.0842;//awg24
            var KwireP = 0.01317;//awg16
            var ImaxR = 0.577;//awg24
            var ImaxP = 3.68;//awg16
            var Rcon = 0.1;
            var awg = document.getElementsByName("awg");     // radio button wire gauge input run
            var Imax;
            var eff = 0.8;
            var currentR = 0;
            var currentP = 0;
            var poeFixedVolts = 55.0;
            var vload;
            var vpoe;
            var loadvolts = $("#loadvolts");
            var loadamps = $("#loadamps");
            var loadwatts = $("#loadwatts");
            
            var poevolts = $("#poevolts");
            var poeamps = $("#poeamps");
            var poewatts = $("#poewatts");
            
            var vinslider = $("#vinslider");// vin slider div
            var vintext = $( "#vintext" );// vin text box            
            var loadtype = $("#loadtype");// load slider div
            var lineslider = $("#lineslider");// line slider div    
            
            var feedslider = $("#feedslider");//feed line slider
            var feedtext = $("#feedtext");//feed line text box
            var linetext = $("#linetext");// line text box
            var loadslider = $("#loadslider");// load slider div
            var loadtext = $("#loadtext");// load text box
            var loadlabel = $("#loadlabel");//load slider label
            var alarmtextR = $("#alarmsR");
            var alarmtextP = $("#alarmsP");
            var checkedLoad = document.getElementsByName("load");
            var loadIsR = false;
            var vinvalue = 48;
            var feedvalue = 10;
            var linevalue = 0;
            var loadvalue = 100;
            var gaugeR = $("#awgr");
            var gaugeP = $("#awgf");
            var poeOutWatts = $("#poeOutWatts");
            var poeOutVolts = $("#poeOutVolts");
            var poeOutAmps = $("#poeOutAmps");
            var poeOutPower;
            
            vinslider.slider({
                range: "max",
                min: 0,
                max: 100,
                value: 48,
                orientation: "vertical",
                slide: function( event, ui ) {
                    vintext.val( ui.value);
                    $(ui.value).val($('#vintext').val());
                    vinvalue = ui.value;
                    calculate();
                }
            });

            vintext.val(48);//set initial value in textbox
            vintext.change(function() {
                vinslider.slider("value" , $(this).val());
                vinvalue = $(this).val();
                calculate();
            });
    //new
            feedslider.slider({
                range: "max",
                min: 0,
                max: 200,
                value: 0,
                slide: function(event, ui){
                    feedtext.val(ui.value);
                    $(ui.value).val($("#feedtext").val());
                    feedvalue = ui.value;
                    calculate();
                }
            });

            feedtext.val(0);//set initial value in textbox
            feedtext.change(function(){
                feedslider.slider("value", $(this).val());
                feedvalue = $(this).val();
                calculate();
            });
    //new
            lineslider.slider({
                range: "max",
                min: 0,
                max: 200,
                value: 0,
                slide: function(event, ui){
                    linetext.val(ui.value);
                    $(ui.value).val($("#linetext").val());
                    linevalue = ui.value;
                    calculate();
                }
            });

            linetext.val(0);//set initial value in textbox
            linetext.change(function(){
                lineslider.slider("value", $(this).val());
                linevalue = $(this).val();
                calculate();
            });
            
            loadslider.slider({
                range: "max",
                min: 1,
                max: 150,
                value: 100,
                orientation: "vertical",
                slide: function(event, ui){
                    loadtext.val(ui.value);
                    $(ui.value).val(loadtext.val());
                    loadvalue = ui.value;
                    calculate();

                }
            });

            loadtext.val(100);//set initial value in textbox
            loadtext.change(function(){
                loadslider.slider("value", $(this).val());
                loadvalue = $(this).val();
                calculate();
            });   
            
            //PoE feed line
            gaugeP.change (function(){
                switch(gaugeP.val()){
                    case 'AWG20': 
                        KwireP = 0.03331;
                        ImaxP = 1.44;
                        break;
                    case 'AWG18': 
                        KwireP = 0.02095;
                        ImaxP = 2.3;
                        break;
                    case 'AWG16': 
                        KwireP = 0.01317;
                        ImaxP = 3.68;
                        break;
                    case 'AWG14': 
                        KwireP = 0.008286;
                        ImaxP = 5.9;
                        break;
                    case 'AWG12': 
                        KwireP = 0.005211;
                        ImaxP = 9.3;
                        break;
                    case 'AWG10': 
                        KwireP = 0.003277;
                        ImaxP = 15.0;
                        break;
                }
                calculate();
            });
            
            //Radio ethernet line
            gaugeR.change (function(){
                switch(gaugeR.val()){
                    case 'AWG26': 
                        KwireR = 0.1339;
                        ImaxR = 0.361;
                        break;
                    case 'AWG24': 
                        KwireR = 0.08422;
                        ImaxR = 0.577;
                        break;
                    case 'AWG22': 
                        KwireR = 0.05296;
                        ImaxR = 0.920;
                        break;
                }
                calculate();
            });

            var vloadx;
            var vpoex;
            var Reth;
            var Rfeed;
            function calculate(){
                vinvalue = Math.abs(vinvalue);
                linevalue = Math.abs(linevalue);
                loadvalue = Math.abs(loadvalue);
                feedvalue = Math.abs(feedvalue);

                currentR = getCurrent(poeFixedVolts, linevalue, loadvalue, KwireR/4, Rcon, 1.0);
                poeOutPower = currentR * poeFixedVolts;
                currentP = getCurrent(vinvalue, feedvalue, poeOutPower, KwireP, Rcon, eff);
                
                Reth = parseFloat(Rcon + linevalue * KwireR / 2);
                Rfeed = parseFloat(Rcon + 2 * feedvalue * KwireP);
                vload = parseFloat(55 - currentR * Reth);
                vpoe = parseFloat(vinvalue - currentP * Rfeed);
                
                writeConsole();
                
                poeamps.text(parseFloat(currentP).toFixed(2) + "A");
                poevolts.text(vpoe.toFixed(2) + "V");
                poewatts.text((parseFloat(currentP * vpoe)).toFixed(2) + "W");
                
                if(currentP > ImaxP){
                    alarmtextP.text("Input current exceeds maximum (" + ImaxP + "A) \nfor selected wire gauge");
                }else {
                    alarmtextP.text("Maximum current for " + gaugeP.val() + " is " + ImaxP + "A");
                }
                
                if(isNaN(currentP) && Rfeed > 0.5){//just so zero length doesn't trip
                    alarmtextP.text("Feed length excessive");
                    alarmtextP.css(({color: 'red'}));
                }else {
                    alarmtextP.css(({color: 'black'}));
                }
                
                if(vpoe < 44){
                    $("#poe44").css(({color: 'red'}));
                    poevolts.css(({color: 'red'}));
                }else{
                   $("#poe44").css(({color: 'black'})); 
                    poevolts.css(({color: 'black'}));
                }
                
                
                
                
                loadamps.text(parseFloat(currentR).toFixed(2) + "A");
                loadvolts.text(vload.toFixed(2) + "V");
                loadwatts.text((parseFloat(currentR * vload)).toFixed(2) + "W");
                
                if(currentR > ImaxR * 4){
                    alarmtextR.text("Radio current exceeds maximum (" + (ImaxR * 4).toFixed(2) + "A) \nfor selected ethernet wire gauge");
                }else {
                    alarmtextR.text("Maximum current for " + gaugeR.val() + "*4 is " + (4 * ImaxR).toFixed(2) + "A");
                }
                
                if(isNaN(currentR)){
                    alarmtextR.text("Ethernet length excessive");
                    alarmtextR.css(({color: 'red'}));
                }else {
                    alarmtextR.css(({color: 'black'}));
                }
                
                if(vload < 40){
                    $("#rad40").css(({color: 'red'}));
                    loadvolts.css(({color: 'red'}));
                }else{
                    $("#rad40").css(({color: 'black'}));
                    loadvolts.css(({color: 'black'}));
                }
                
                poeOutVolts.text(poeFixedVolts + " Fixed");
                poeOutWatts.text(poeOutPower.toFixed(2));
                poeOutAmps.text(parseFloat(currentR).toFixed(2) + "A");
                
                if(isNaN(currentP) || isNaN(currentR)){
                    redAlert();
                }

            }
            
            function redAlert(){
                poeamps.text("Disabled");
                poevolts.text("Disabled");
                poewatts.text("Disabled");
                loadamps.text("Disabled");
                loadvolts.text("Disabled");
                loadwatts.text("Disabled");
                poeOutAmps.text("Disabled");
                poeOutVolts.text("Disabled");
                poeOutWatts.text("Disabled");
            }
            //evaluates quadratic for current loop - constant power case only
            function getCurrent(volts, length, power, Kwire, Rcon, eff){
                var a = length * Kwire * 2 + Rcon;
                var b = -1 * volts;
                var c = power / eff;
                var rad = Math.pow(b, 2) - (4 * a * c);
                var current = ((-1 * b - Math.sqrt(rad)) / (2 * a));
                return parseFloat(current);
            }

            function writeConsole(){
                console.info("Radio I: " + parseFloat(currentR).toFixed(2));
                console.info("PoE I: " + parseFloat(currentP).toFixed(2));
                console.info("Radio P: " + loadvalue);
                console.info("Radio V: " + vload.toFixed(2));
                console.info("PoE V: " + vpoe.toFixed(2));
                console.info("Source V: " + vinvalue);
                console.info("Eth len: " + linevalue);
                console.info("Feed len: " + feedvalue);
                console.info("PoE Po: " + poeOutPower.toFixed(2));
                //console.info("ImaxR: " + ImaxR);
                //console.info("ImaxP: " + ImaxP);
                console.info("Reth: " + Reth.toFixed(2));
                console.info("Rfeed: " + Rfeed.toFixed(2));
                console.info("");
            }
            calculate();
        });




























