//var _ = require('underscore');
//var async = require('async');
var fs = require('fs');
//var moment = require("moment");

var PDFdoc = require('pdfkit');

exports.makedoc = makedoc;

function makedoc(filename, pdoc){
  var doc = new PDFdoc({
    size: 'A4',
    layout: 'portrait',
    info: {
      Title: 'GetLegal Policy Schedule',
      Author: 'GetLegal',
      Subject: 'GetLegal Policy Schedule',
      Producer: 'GetLegal',
      Creator: 'GetLegal'
    }
  });

  doc.pipe(fs.createWriteStream(__dirname + '/../pdf_docs/' + filename + '.pdf'));
  page1(doc,pdoc);
  //doc.addPage();
  page2(doc,pdoc);
  //footer(doc,pdoc);
  doc.end();
  console.log('Done creating PDF');
}



function page1(doc,pdoc) {

  if(pdoc.policy_details.white_label == 'GoSure'){
    doc.image(__dirname + '/assets/logo.png', 10, 10, {
      width: 120
    });
  }
  if(pdoc.policy_details.white_label == 'Nico'){
    doc.image(__dirname + '/assets/logo_blue.png', 10, 10, {
      width: 120
    });
  }


  doc.moveTo(0, 60).strokeColor('#999999').lineWidth(0.1).lineTo(doc.page.width, 60).stroke();

  doc.y = 80;
  doc.x = 30;
  doc.font('Helvetica').fontSize(16).fillColor('#999999');
  if(pdoc.policy_details.white_label == 'GoSure'){
    doc.text("GetLegal: Policy Schedule");
  }

  if(pdoc.policy_details.white_label == 'Nico'){
    doc.text("Nico Legal: Policy Schedule");
  }

  doc.moveDown(1);

  doc.font('Helvetica').fontSize(11).fillColor('#000000');
  // if(pdoc.product_fc){
  //   doc.text(pdoc.product_fc.desc);
  // } else {
    if(pdoc.policy_details.plan){
      doc.text(pdoc.policy_details.plan);
    }
  // }

  doc.text("Policy Number: " + pdoc.policy_details.policy_number);
  doc.moveDown(1.5);

  doc.font('Helvetica').fontSize(9).fillColor('#000000');
  //doc.moveDown(3);

  var y_primary = doc.y;

  var c1w = 100;
  var c2w = 150;
  var c3w = 100;
  var c4w = 200;
  var margin = 5;

  var c1x = 30;
  var c2x = c1x + c1w + margin;
  var c3x = c2x + c2w + margin;
  var c4x = c3x + c3w + margin;
  var c5x = c4x + c4w + margin;

  var primary_y = doc.y;
  var spouse_y = doc.y;

  doc.text('Primary Member', c1x, primary_y, {underline:true});
  doc.text('Name', c1x);
  doc.text('Cell number', c1x);
  doc.text('Date of Birth', c1x);
  doc.text('Email', c1x);
  doc.text('ID Number', c1x);
  doc.text(' ',c2x,primary_y);
  doc.text(pdoc.member_details.title +' '+ pdoc.member_details.first_name +' '+ pdoc.member_details.last_name,c2x);
  doc.text(pdoc.member_details.cell_number,c2x);
  doc.text(pdoc.member_details.dob.substr(0, 10),c2x);
  doc.text(pdoc.member_details.email,c2x);
  doc.text(pdoc.member_details.id_number,c2x);

  if(pdoc.secondary_members_details && pdoc.secondary_members_details.length > 0){
    for(var i = 0; i < pdoc.secondary_members_details.length; i++){
      if(pdoc.secondary_members_details[i].type === 'Spouse'){
        var s = pdoc.secondary_members_details[i];
        doc.text('Spouse', c3x, spouse_y, {underline:true});
        doc.text('Name', c3x);
        doc.text('Cell number', c3x);
        doc.text('Date of Birth', c3x);
        doc.text('Email', c3x);
        doc.text('ID Number', c3x);
        doc.text(' ',c4x,spouse_y);
        doc.text((s.title ? s.title + ' ' : '') + (s.first_name ? s.first_name : ' ') +' '+ (s.last_name ? s.last_name : ' '),c4x);
        doc.text(s.cell_number ? s.cell_number : ' ',c4x);
        doc.text(s.dob ? s.dob.substr(0, 10) : ' ',c4x);
        doc.text(s.email ? s.email : ' ',c4x);
        doc.text(s.id_number ? s.id_number : ' ',c4x);
      }
    }
  }
  // doc.text('Spouse', c3x, spouse_y, {underline:true});
  // doc.text('Name', c3x);
  // doc.text('Cell number', c3x);
  // doc.text('Date of Birth', c3x);
  // doc.text('Email', c3x);
  // doc.text('ID Number', c3x);
  // doc.text(' ',c4x,spouse_y);
  // doc.text((pdoc.spouse_title ? pdoc.spouse_title + ' ' : '') + (pdoc.spouse_first_name ? pdoc.spouse_first_name : ' ') +' '+ (pdoc.spouse_last_name ? pdoc.spouse_last_name : ' '),c4x);
  // doc.text(pdoc.spouse_cell_number ? pdoc.spouse_cell_number : ' ',c4x);
  // doc.text(pdoc.spouse_dob ? pdoc.spouse_dob.substr(0, 10) : ' ',c4x);
  // doc.text(pdoc.spouse_email ? pdoc.spouse_email : ' ',c4x);
  // doc.text(pdoc.spouse_id_number ? pdoc.spouse_id_number : ' ',c4x);

  doc.moveDown(1.5);
  var beneficiary_y = doc.y;

  // if(pdoc.secondary_members_details && pdoc.secondary_members_details.length > 0){
  //   for(var i = 0; i < pdoc.secondary_members_details.length; i++){
  //     if(pdoc.secondary_members_details[i].type === 'Child'){
  //       var c = pdoc.secondary_members_details[i];
  //       var j = i + 1;
  //       doc.text('Child ' + j, c1x,beneficiary_y, {underline:true});
  //       doc.text('Name', c1x);
  //       doc.text('Cell number', c1x);
  //       doc.text('Relationship', c1x);
  //       doc.text(' ',c2x,beneficiary_y);
  //       doc.text((c.title ? c.title : '') +' '+ (c.first_name ? c.first_name : ' ') +' '+ (c.last_name ? c.last_name : ' '),c2x);
  //       doc.text(c.cell_number ? c.cell_number : ' ',c2x);
  //       doc.text(c.relationship ? c.relationship : ' ',c2x);
  //       doc.moveDown(1.5);
  //     }
  //   }
  // }

  // doc.text('Beneficiary 1', c1x,beneficiary_y, {underline:true});
  // doc.text('Name', c1x);
  // doc.text('Cell number', c1x);
  // doc.text('Relationship', c1x);
  // doc.text(' ',c2x,beneficiary_y);
  // doc.text((pdoc.beneficiary_title ? pdoc.beneficiary_title : '') +' '+ (pdoc.beneficiary_first_name ? pdoc.beneficiary_first_name : ' ') +' '+ (pdoc.beneficiary_last_name ? pdoc.beneficiary_last_name : ' '),c2x);
  // doc.text(pdoc.beneficiary_cell_number ? pdoc.beneficiary_cell_number : ' ',c2x);
  // doc.text(pdoc.beneficiary_relationship ? pdoc.beneficiary_relationship : ' ',c2x);

  // doc.text('Beneficiary 2', c3x,beneficiary_y, {underline:true});
  // doc.text('Name', c3x);
  // doc.text('Cell number', c3x);
  // doc.text('Relationship', c3x);
  // doc.text(' ',c4x,beneficiary_y);
  // doc.text((pdoc.beneficiary2_title ? pdoc.beneficiary2_title : '') +' '+ (pdoc.beneficiary2_first_name ? pdoc.beneficiary2_first_name : ' ') +' '+ (pdoc.beneficiary2_last_name ? pdoc.beneficiary2_last_name : ' '),c4x);
  // doc.text(pdoc.beneficiary2_cell_number ? pdoc.beneficiary2_cell_number : ' ',c4x);
  // doc.text(pdoc.beneficiary2_relationship ? pdoc.beneficiary2_relationship : ' ',c4x);

  doc.moveDown(1.5);
  var payment_y = doc.y;

  doc.text('Payment', c1x,payment_y, {underline:true});
  doc.text('Method', c1x);
  if (pdoc.policy_details.payment_method == 'Debit Order') {
    doc.text('Bank', c1x);
    doc.text('Account Holder', c1x);
    doc.text('Account Type', c1x);
    doc.text('Account Number', c1x);
    doc.text('Branch Code', c1x);
  } else {
    doc.text('Company Name', c1x);
    doc.text('Employee Number', c1x);
    // doc.text('Employee Firstname', c1x);
    // doc.text('Employee Lastname', c1x);
    // doc.text('Employee ID Number', c1x);
  }

  doc.text(' ',c2x,payment_y);
  doc.text(pdoc.payment_details.payment_method ? pdoc.payment_details.payment_method : ' ',c2x);
  if (pdoc.payment_details.payment_method == 'Debit Order') {
    doc.text(pdoc.payment_details.bank ? pdoc.payment_details.bank : ' ',c2x);
    doc.text(pdoc.payment_details.account_holder_name ? pdoc.payment_details.account_holder_name : ' ',c2x);
    doc.text(pdoc.payment_details.account_type ? pdoc.payment_details.account_type : ' ',c2x);
    doc.text(pdoc.payment_details.account_number ? pdoc.payment_details.account_number : ' ',c2x);
    doc.text(pdoc.payment_details.branch_code ? pdoc.payment_details.branch_code : ' ',c2x);
  } else {
    doc.text(pdoc.payment_details.company_name ? pdoc.payment_details.company_name : ' ',c2x);
    doc.text(pdoc.payment_details.employee_number ? pdoc.payment_details.employee_number : ' ',c2x);
    // doc.text(pdoc.payment_details.employee_first_name ? pdoc.payment_details.employee_first_name : ' ',c2x);
    // doc.text(pdoc.payment_details.employee_last_name ? pdoc.payment_details.employee_last_name : ' ',c2x);
    // doc.text(pdoc.payment_details.employee_id_number ? pdoc.payment_details.employee_id_number : ' ',c2x);
  }

  doc.moveDown(1.5);
  var address_y = doc.y;

  doc.text('Physical Address', c1x,address_y, {underline:true});
  doc.text('Street', c1x);
  doc.text('Suburb', c1x);
  doc.text('City', c1x);
  doc.text('Postal Code', c1x);
  doc.text(' ',c2x,address_y);
  doc.text(pdoc.member_details.physical_street ? pdoc.member_details.physical_street : ' ',c2x);
  doc.text(pdoc.member_details.physical_suburb ? pdoc.member_details.physical_suburb : ' ',c2x);
  doc.text(pdoc.member_details.physical_city ? pdoc.member_details.physical_city : ' ',c2x);
  doc.text(pdoc.member_details.physical_postal_code ? pdoc.member_details.physical_postal_code : ' ',c2x);

  doc.text('Postal Address', c3x,address_y, {underline:true});
  doc.text('Street', c3x);
  doc.text('Suburb', c3x);
  doc.text('City', c3x);
  doc.text('Postal Code', c3x);
  doc.text(' ',c4x,address_y);
  doc.text(pdoc.member_details.postal_street ? pdoc.member_details.postal_street : ' ',c4x);
  doc.text(pdoc.member_details.postal_suburb ? pdoc.member_details.postal_suburb : ' ',c4x);
  doc.text(pdoc.member_details.postal_city ? pdoc.member_details.postal_city : ' ',c4x);
  doc.text(pdoc.member_details.postal_postal_code ? pdoc.member_details.postal_postal_code : ' ',c4x);

}





function page2(doc,pdoc) {
//  doc.image(__dirname + '/assets/logo.png', 10, 10, {
//    width: 120
//  });
//  doc.moveTo(0, 50).strokeColor('#999999').lineWidth(0.1).lineTo(doc.page.width, 50).stroke();
//
//  doc.y = 80;
//  doc.x = 30;
//  doc.font('Helvetica').fontSize(16).fillColor('#999999');
//  doc.text("Policy Shedule");
//
//  doc.moveDown(1);
//
//  doc.font('Helvetica').fontSize(9).fillColor('#000000');
//  doc.text(pdoc.product_fc.desc);
//  doc.text("Policy Number: " + pdoc.policy_number);
//  doc.moveDown(1.5);
  doc.moveDown(1.5);
  doc.text('Breakdown',30, doc.y, {underline:true});
  doc.moveDown(1);

  //Grid row points
  var rowx = doc.x;
  var rowy = [];
  rowy.push(doc.y);

  //Grid Heading

  var t1 = 'Insured';
  var t2 = 'Name';
  var t3 = 'Age';
  var t4 = 'Premiums';
  // var t5 = 'Premiums';

  var c1w = 80;
  var c2w = 190;
  var c3w = 20;
  var c4w = 70;
  // var c5w = 70;
  var margin = 5;

  var c1x = 20;
  var c2x = c1x + c1w + margin;
  var c3x = c2x + c2w + margin;
  var c4x = c3x + c3w + margin;
  var c5x = c4x + c4w + margin;
  // var c6x = c5x + c5w + margin;

  var indent1 = c1x;
  var indent2 = c2x;
  var indent3 = c3x + (c3w - doc.widthOfString(t3));
  var indent4 = c4x + (c4w - doc.widthOfString(t4));
  // var indent5 = c5x + (c5w - doc.widthOfString(t5));

  doc.text(t1,{indent: indent1}).moveUp();
  doc.text(t2,{indent: indent2}).moveUp();
  doc.text(t3,{indent: indent3}).moveUp();
  doc.text(t4,{indent: indent4});
  // doc.text(t5,{indent: indent5});
  doc.moveDown(0.5);



  //grid entries
  var l = 0;
  if (pdoc.policy_details.premium_breakdown) {l = pdoc.policy_details.premium_breakdown.length};
  for (var i = 0; i < l; i++){
    rowy.push(doc.y);

    t1 = pdf_string(pdoc.policy_details.premium_breakdown[i].type);
    t2 = pdf_string(pdoc.policy_details.premium_breakdown[i].name);
    t3 = pdf_number(pdoc.policy_details.premium_breakdown[i].age);
    t4 = pdf_string('N/A');
    // t4 = pdf_string('N/A');
    // t5 = pdf_string('N/A');

    t3 = (t3 == '0' ? ' ' : t3);

    indent1 = c1x;
    indent2 = c2x;
    indent3 = c3x + (c3w - doc.widthOfString(t3));
    indent4 = c4x + (c4w - doc.widthOfString(t4));
    // indent5 = c5x + (c5w - doc.widthOfString(t5));

    doc.text(t1,{indent: indent1}).moveUp();
    doc.text(t2,{indent: indent2}).moveUp();
    doc.text(t3,{indent: indent3}).moveUp();
    doc.text(t4,{indent: indent4}).moveDown(0.5);
    // doc.text(t5,{indent: indent5}).moveDown(0.5);
  }

  //last row
  rowy.push(doc.y);
  t1 = 'Total Premium';
  t4 = pdf_currency(pdoc.policy_details.plan_type.premium);

  indent1 = c1x;
  indent4 = c4x + (c4w - doc.widthOfString(t4));

  doc.text(t1,{indent: indent1}).moveUp();
  doc.text(t4,{indent: indent4}).moveDown(0.5);

  rowy.push(doc.y);



  //grid lines
  doc.strokeColor('#999999');
  var x_offset = 27;
  var y_offset = -5;
  for (var i = 0; i < rowy.length - 1; i++){
    doc.moveTo(c1x + x_offset, rowy[i] + y_offset).lineTo(c5x + x_offset, rowy[i] + y_offset).stroke();
    doc.moveTo(c1x + x_offset, rowy[i] + y_offset).lineTo(c1x + x_offset, rowy[i + 1] + y_offset).stroke();
    doc.moveTo(c2x + x_offset, rowy[i] + y_offset).lineTo(c2x + x_offset, rowy[i + 1] + y_offset).stroke();
    doc.moveTo(c3x + x_offset, rowy[i] + y_offset).lineTo(c3x + x_offset, rowy[i + 1] + y_offset).stroke();
    doc.moveTo(c4x + x_offset, rowy[i] + y_offset).lineTo(c4x + x_offset, rowy[i + 1] + y_offset).stroke();
    doc.moveTo(c5x + x_offset, rowy[i] + y_offset).lineTo(c5x + x_offset, rowy[i + 1] + y_offset).stroke();
    // doc.moveTo(c6x + x_offset, rowy[i] + y_offset).lineTo(c6x + x_offset, rowy[i + 1] + y_offset).stroke();
  }
  //last line
  doc.moveTo(c1x + x_offset, rowy[rowy.length - 1] + y_offset).lineTo(c5x + x_offset, rowy[rowy.length - 1] + y_offset).stroke();
  //move back to last position
  doc.moveTo(rowx, rowy[rowy.length - 1]);


}


function footer(doc,pdoc){
  var footer_y = doc.page.height - 50;
  doc.moveTo(0, footer_y).strokeColor('#999999').lineWidth(0.1).lineTo(doc.page.width, footer_y).stroke();
  //doc.y = footer_y - 15;
  //doc.x = 30;

  doc.text('GetSure - an Authorised Financial Services Provider in terms of the FAIS Act (FSP 43574)',30,footer_y - 50);
  doc.text('Support: info@getsuregroup.com');
  doc.text('Copyright @; GetSureGroup S.A. All rights reserved.');
}

function pdf_string(v){
  var s = v;
  if (s === undefined) {
    s = ' ';
  }
  if (s == '') {
    s = ' ';
  }
  return s;
}

function pdf_number(v){
  var s = 0;
  if (isNumber(v)) {
    s = v.toString();
  } else {
    s = '0';
  };
  return s;
}

function pdf_currency(v){
  var s = 0;
  if (isNumber(v)) {
    s = parseFloat(Math.round(v * 100) / 100).toFixed(2);
  } else {
    s = '0.00';
  };
  return s;
}

function isNumber(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
};