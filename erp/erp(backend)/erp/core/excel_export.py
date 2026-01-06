import io
from django.http import HttpResponse
from django.views.generic import View
import xlsxwriter

class ExcelExport:
    def calc_tax_category(tax_category, price, amount):
        tax_set = {"supply": 0, "surtax": 0, "total_price": 0}
        if tax_category == 1 or tax_category == "부가세 적용":
            tax_set["supply"] = price
            tax_set["surtax"] = round(price * 0.1)
            tax_set["total_price"] = amount * round(price * 1.1)
        elif tax_category == 2 or tax_category == "상품에 포함":
            tax_set["supply"] = round(price * (10 / 11))
            tax_set["surtax"] = round(price * (1 / 11))
            tax_set["total_price"] = amount * price
        else:
            tax_set["supply"] = price
            tax_set["surtax"] = 0
            tax_set["total_price"] = amount * price

        return tax_set

    def get(self, data, req):
        # Create an in-memory output file for the new workbook.
        output = io.BytesIO()

        # Even though the final file will be in memory the module uses temp
        # files during assembly for efficiency. To avoid this on servers that
        # don't allow temp files, for example the Google APP Engine, set the
        # 'in_memory' Workbook() constructor option as shown in the docs.
        workbook = xlsxwriter.Workbook(output)
        worksheet = workbook.add_worksheet()

        # 공급가, 부가세, 총금액 계산
        for i in data["his"]:
            tax_set = ExcelExport.calc_tax_category(
                i["tax_category"], i["price"], i["amount"]
            )
            i["supply"] = tax_set["supply"]
            i["surtax"] = tax_set["surtax"]
            i["total_price"] = tax_set["total_price"]

        # column 높이 설정
        column_width = [
            1,
            7,
            6,
            12.88,
            2.75,
            1.5,
            2.38,
            3,
            5.88,
            2.38,
            10.25,
            8.13,
            6.88,
            10.25,
            1,
        ]
        for i in range(0, 15):
            worksheet.set_column(i, i, column_width[i])

        colors = ["red", "#3366FF"]
        count = 0

        for i in colors:
            # row 높이 설정
            row_height = [12.5, 34.5, 18, 18, 21, 18, 18, 23.25, 21.75]
            for j in range(0, 9):
                worksheet.set_row(j + count, row_height[j])

            count += 2

            # #B2~N2까지 설정
            B2N2_format = workbook.add_format(
                {
                    "border": 2,
                    "bottom": 0,
                    "border_color": i,
                    "bold": 1,
                    "align": "center",
                    "valign": "vcenter",
                    "color": i,
                    "font_name": "굴림체",
                }
            )
            B2N2_font12_format = workbook.add_format(
                {
                    "font_size": 12,
                    "bold": 1,
                    "align": "center",
                    "valign": "vcenter",
                    "color": i,
                    "font_name": "굴림체",
                }
            )
            B2N2_font18_format = workbook.add_format(
                {
                    "font_size": 18,
                    "bold": 1,
                    "align": "center",
                    "valign": "vcenter",
                    "color": i,
                    "font_name": "굴림체",
                }
            )
            header_text = "(공급자 보관용)"
            if i == "#3366FF":
                header_text = "(공급받는자 보관용)"
            worksheet.merge_range(f"B{str(count)}:N{str(count)}", "", B2N2_format)
            worksheet.write_rich_string(
                f"B{str(count)}",
                B2N2_font18_format,
                "거 래 명 세 표 ",
                B2N2_font12_format,
                header_text,
                B2N2_format,
            )

            count += 1

            # B3~I3까지 설정
            border_format = workbook.add_format(
                {"border": 0, "left": 2, "left_color": i,}
            )
            worksheet.merge_range(f"B{str(count)}:I{str(count)}", "", border_format)

            # #J3~J7 설정
            J3J7_format = workbook.add_format(
                {
                    "border": 2,
                    "border_color": i,
                    "align": "center",
                    "valign": "vcenter",
                    "color": i,
                    "font_name": "굴림체",
                    "font_size": 10,
                }
            )
            J3J7_format.set_text_wrap()
            worksheet.merge_range(
                f"J{str(count)}:J{str(count+4)}", "공\n\n급\n\n자", J3J7_format
            )

            # K3 설정
            K3_format = workbook.add_format(
                {
                    "top": 2,
                    "right": 1,
                    "bottom": 1,
                    "border_color": i,
                    "align": "center",
                    "valign": "vcenter",
                    "color": i,
                    "font_name": "굴림체",
                    "font_size": 10,
                }
            )
            worksheet.write(f"K{str(count)}", "등록 번호", K3_format)

            # L3~N3 설정
            L3N3_format = workbook.add_format(
                {
                    "top": 2,
                    "right": 2,
                    "border_color": i,
                    "align": "center",
                    "valign": "vcenter",
                    "bold": 1,
                    "color": "black",
                    "font_name": "굴림체",
                    "font_size": 10,
                }
            )
            worksheet.merge_range(
                f"L{str(count)}:N{str(count)}", "416-10-16614", L3N3_format
            )

            count += 1

            # B4 설정
            worksheet.write(f"B{str(count)}", "", border_format)

            # C4 설정
            C4_format = workbook.add_format(
                {
                    "border": 0,
                    "bottom": 1,
                    "bottom_color": i,
                    "align": "right",
                    "valign": "vcenter",
                    "color": "black",
                    "font_name": "굴림체",
                    "font_size": 10,
                }
            )
            worksheet.write(
                f"C{str(count)}", data["tra"]["register_date"][0:4], C4_format
            )

            # D4 설정
            D4_format = workbook.add_format(
                {
                    "border": 0,
                    "bottom": 1,
                    "bottom_color": i,
                    "align": "center",
                    "valign": "vcenter",
                    "color": i,
                    "font_name": "굴림체",
                    "font_size": 10,
                }
            )
            worksheet.write(f"D{str(count)}", "년", D4_format)

            # E4 설정
            E4_format = workbook.add_format(
                {
                    "border": 0,
                    "bottom": 1,
                    "bottom_color": i,
                    "align": "right",
                    "valign": "vcenter",
                    "color": "black",
                    "font_name": "굴림체",
                    "font_size": 10,
                }
            )
            worksheet.write(
                f"E{str(count)}", data["tra"]["register_date"][5:7], E4_format
            )

            # F4 설정
            F4_format = workbook.add_format(
                {
                    "border": 0,
                    "bottom": 1,
                    "bottom_color": i,
                    "align": "center",
                    "valign": "vcenter",
                    "color": i,
                    "font_name": "굴림체",
                    "font_size": 10,
                }
            )
            worksheet.write(f"F{str(count)}", "월", F4_format)

            # G4 설정
            G4_format = workbook.add_format(
                {
                    "border": 0,
                    "bottom": 1,
                    "bottom_color": i,
                    "align": "right",
                    "valign": "vcenter",
                    "color": "black",
                    "font_name": "굴림체",
                    "font_size": 10,
                }
            )
            worksheet.write(
                f"G{str(count)}", data["tra"]["register_date"][8:10], G4_format
            )

            # H4 설정
            H4_format = workbook.add_format(
                {
                    "border": 0,
                    "bottom": 1,
                    "bottom_color": i,
                    "align": "center",
                    "valign": "vcenter",
                    "color": i,
                    "font_name": "굴림체",
                    "font_size": 10,
                }
            )
            worksheet.write(f"H{str(count)}", "일", H4_format)

            # K4 설정
            K4_format = workbook.add_format(
                {
                    "border": 1,
                    "border_color": i,
                    "align": "center",
                    "valign": "vcenter",
                    "color": i,
                    "font_name": "굴림체",
                    "font_size": 10,
                }
            )
            worksheet.write(f"K{str(count)}", "상호(법인명)", K4_format)

            # L4 설정
            L4_format = workbook.add_format(
                {
                    "top": 1,
                    "right": 1,
                    "border_color": i,
                    "align": "center",
                    "valign": "vcenter",
                    "bold": 1,
                    "color": "black",
                    "font_name": "굴림체",
                    "font_size": 10,
                }
            )
            worksheet.write(f"L{str(count)}", "인지컴", L4_format)

            # M4 설정
            M4_format = workbook.add_format(
                {
                    "top": 1,
                    "right": 1,
                    "border_color": i,
                    "align": "center",
                    "valign": "vcenter",
                    "color": i,
                    "font_name": "굴림체",
                    "font_size": 10,
                }
            )
            worksheet.write(f"M{str(count)}", "성  명", M4_format)

            # N4 설정
            N4_format = workbook.add_format(
                {
                    "top": 1,
                    "right": 2,
                    "border_color": i,
                    "align": "center",
                    "valign": "vcenter",
                    "bold": 1,
                    "color": "black",
                    "font_name": "굴림체",
                    "font_size": 10,
                }
            )
            worksheet.write(f"N{str(count)}", "서우종", N4_format)

            # 인장 이미지 삽입
            worksheet.insert_image(
                f"N{str(count)}",
                "stamp.png",
                {"x_offset": 65, "x_scale": 0.59, "y_scale": 0.99},
            )

            count += 1

            # B5~I5까지 설정
            B5I5_format = workbook.add_format(
                {"border": 0, "left": 2, "left_color": i,}
            )
            worksheet.merge_range(f"B{str(count)}:I{str(count)}", "", B5I5_format)

            # K5 설정
            K5_format = workbook.add_format(
                {
                    "border": 1,
                    "border_color": i,
                    "align": "center",
                    "valign": "vcenter",
                    "color": i,
                    "font_name": "굴림체",
                    "font_size": 10,
                }
            )
            worksheet.write(f"K{str(count)}", "사업장주소", K5_format)

            # L5~N5 설정
            L5N5_format = workbook.add_format(
                {
                    "top": 1,
                    "right": 2,
                    "border_color": i,
                    "align": "center",
                    "valign": "vcenter",
                    "bold": 1,
                    "color": "black",
                    "font_name": "굴림체",
                    "font_size": 8,
                }
            )
            worksheet.merge_range(
                f"L{str(count)}:N{str(count)}", "순천시 해룡면 해룡산단5로 51", L5N5_format
            )

            count += 1

            # B6 설정
            B6_format = workbook.add_format({"border": 0, "left": 2, "left_color": i,})
            worksheet.write(f"B{str(count)}", "", B6_format)

            # C6~G6까지 설정
            C6G6_format = workbook.add_format(
                {
                    "border": 0,
                    "align": "center",
                    "valign": "vcenter",
                    "bold": 1,
                    "color": "black",
                    "font_name": "굴림체",
                    "font_size": 10,
                }
            )
            worksheet.merge_range(
                f"C{str(count)}:G{str(count)}",
                data["tra"]["customer_name"],
                C6G6_format,
            )

            # H6 설정
            H6_format = workbook.add_format(
                {
                    "border": 0,
                    "align": "center",
                    "valign": "vcenter",
                    "color": i,
                    "font_name": "굴림체",
                    "font_size": 10,
                }
            )
            worksheet.write(f"H{str(count)}", "귀하", H6_format)

            # K6 설정
            K6_format = workbook.add_format(
                {
                    "border": 1,
                    "border_color": i,
                    "align": "center",
                    "valign": "vcenter",
                    "color": i,
                    "font_name": "굴림체",
                    "font_size": 10,
                }
            )
            worksheet.write(f"K{str(count)}", "업      태", K6_format)

            # L6 설정
            L6_format = workbook.add_format(
                {
                    "top": 1,
                    "right": 1,
                    "border_color": i,
                    "align": "center",
                    "valign": "vcenter",
                    "bold": 1,
                    "color": "black",
                    "font_name": "굴림체",
                    "font_size": 10,
                }
            )
            worksheet.write(f"L{str(count)}", "도소매", L6_format)

            # M6 설정
            M6_format = workbook.add_format(
                {
                    "top": 1,
                    "right": 1,
                    "border_color": i,
                    "align": "center",
                    "valign": "vcenter",
                    "color": i,
                    "font_name": "굴림체",
                    "font_size": 10,
                }
            )
            worksheet.write(f"M{str(count)}", "종  목", M6_format)

            # N6 설정
            N6_format = workbook.add_format(
                {
                    "top": 1,
                    "right": 2,
                    "border_color": i,
                    "align": "center",
                    "valign": "vcenter",
                    "bold": 1,
                    "color": "black",
                    "font_name": "굴림체",
                    "font_size": 10,
                }
            )
            worksheet.write(f"N{str(count)}", "컴퓨터", N6_format)

            count += 1

            # B7~I7 설정
            B7I7_format = workbook.add_format(
                {
                    "top": 2,
                    "left": 2,
                    "right": 0,
                    "bottom": 1,
                    "border_color": i,
                    "align": "left",
                    "valign": "vcenter",
                    "color": i,
                    "font_name": "굴림체",
                    "font_size": 10,
                }
            )
            worksheet.merge_range(
                f"B{str(count)}:I{str(count)}", "   아래와 같이 공급합니다.", B7I7_format
            )

            # K7 설정
            K7_format = workbook.add_format(
                {
                    "border": 1,
                    "bottom": 2,
                    "border_color": i,
                    "align": "center",
                    "valign": "vcenter",
                    "color": i,
                    "font_name": "굴림체",
                    "font_size": 10,
                }
            )
            worksheet.write(f"K{str(count)}", "전화 번호", K7_format)

            # L7~N7 설정
            L7N7_format = workbook.add_format(
                {
                    "top": 1,
                    "right": 2,
                    "bottom": 2,
                    "border_color": i,
                    "align": "center",
                    "valign": "vcenter",
                    "bold": 1,
                    "color": "black",
                    "font_name": "굴림체",
                    "font_size": 10,
                }
            )
            worksheet.merge_range(
                f"L{str(count)}:N{str(count)}", "061-727-0981", L7N7_format
            )

            count += 1

            # B8 설정
            B8_format = workbook.add_format({"left": 2, "border_color": i,})
            worksheet.write(f"B{str(count)}", "", B8_format)

            # E8 설정
            E8_format = workbook.add_format(
                {
                    "align": "center",
                    "valign": "vcenter",
                    "bold": 1,
                    "color": "black",
                    "font_name": "굴림체",
                    "font_size": 12,
                }
            )
            worksheet.write(f"E{str(count)}", "\\", E8_format)

            # F8~I8 설정
            F8I8_format = workbook.add_format(
                {
                    "align": "right",
                    "valign": "vcenter",
                    "bold": 1,
                    "color": "black",
                    "font_name": "굴림체",
                    "font_size": 12,
                    "num_format": "#,##0_);(#,##0)",
                }
            )
            worksheet.merge_range(
                f"F{str(count)}:I{str(count)}",
                "=SUM(K10:L"
                + str(len(data["his"]) + 9)
                + ")+SUM(M10:N"
                + str(len(data["his"]) + 9)
                + ")",
                F8I8_format,
            )

            # K8~N8 설정
            K8N8_format = workbook.add_format(
                {
                    "right": 2,
                    "border_color": i,
                    "align": "left",
                    "valign": "vcenter",
                    "bold": 1,
                    "color": "black",
                    "font_name": "굴림체",
                    "font_size": 10,
                }
            )
            worksheet.merge_range(
                f"K{str(count)}:N{str(count)}", "(부가세 포함)", K8N8_format
            )

            count += 1

            # B9~D9 설정
            B9D9_format = workbook.add_format(
                {
                    "border": 2,
                    "border_color": i,
                    "align": "center",
                    "valign": "vcenter",
                    "bold": 1,
                    "color": i,
                    "font_name": "굴림체",
                    "font_size": 10,
                }
            )
            worksheet.merge_range(
                f"B{str(count)}:D{str(count)}", "품      명", B9D9_format
            )

            # E9~F9 설정
            E9F9_format = workbook.add_format(
                {
                    "border": 2,
                    "border_color": i,
                    "align": "center",
                    "valign": "vcenter",
                    "bold": 1,
                    "color": i,
                    "font_name": "굴림체",
                    "font_size": 10,
                }
            )
            worksheet.merge_range(f"E{str(count)}:F{str(count)}", "규 격", E9F9_format)

            # G9~H9 설정
            G9H9_format = workbook.add_format(
                {
                    "border": 2,
                    "border_color": i,
                    "align": "center",
                    "valign": "vcenter",
                    "bold": 1,
                    "color": i,
                    "font_name": "굴림체",
                    "font_size": 10,
                }
            )
            worksheet.merge_range(f"G{str(count)}:H{str(count)}", "수 량", G9H9_format)

            # I9~J9 설정
            I9J9_format = workbook.add_format(
                {
                    "border": 2,
                    "border_color": i,
                    "align": "center",
                    "valign": "vcenter",
                    "bold": 1,
                    "color": i,
                    "font_name": "굴림체",
                    "font_size": 10,
                }
            )
            worksheet.merge_range(f"I{str(count)}:J{str(count)}", "단  가", I9J9_format)

            # K9~L9 설정
            K9L9_format = workbook.add_format(
                {
                    "border": 2,
                    "border_color": i,
                    "align": "center",
                    "valign": "vcenter",
                    "bold": 1,
                    "color": i,
                    "font_name": "굴림체",
                    "font_size": 10,
                }
            )
            worksheet.merge_range(
                f"K{str(count)}:L{str(count)}", "공  급  가  액", K9L9_format
            )

            # M9~N9 설정
            M9N9_format = workbook.add_format(
                {
                    "border": 2,
                    "border_color": i,
                    "align": "center",
                    "valign": "vcenter",
                    "bold": 1,
                    "color": i,
                    "font_name": "굴림체",
                    "font_size": 10,
                }
            )
            worksheet.merge_range(
                f"M{str(count)}:N{str(count)}", "세       액", M9N9_format
            )

            count += 1

            # 내역 리스트 설정
            history_text_format = workbook.add_format(
                {
                    "border": 2,
                    "border_color": i,
                    "align": "center",
                    "valign": "vcenter",
                    "color": "black",
                    "font_name": "굴림체",
                    "font_size": 10,
                }
            )
            history_number_format = workbook.add_format(
                {
                    "border": 2,
                    "border_color": i,
                    "align": "center",
                    "valign": "vcenter",
                    "color": "black",
                    "font_name": "굴림체",
                    "font_size": 10,
                    "num_format": "#,##0_);(#,##0)",
                }
            )
            history_number_right_format = workbook.add_format(
                {
                    "border": 2,
                    "border_color": i,
                    "align": "right",
                    "valign": "vcenter",
                    "color": "black",
                    "font_name": "굴림체",
                    "font_size": 10,
                    "num_format": "#,##0_);(#,##0)",
                }
            )

            for j in data["his"]:
                worksheet.set_row(count - 1, 15.75)
                worksheet.merge_range(
                    "B" + str(count) + ":" + "D" + str(count),
                    j["name"],
                    history_text_format,
                )
                worksheet.merge_range(
                    "E" + str(count) + ":" + "F" + str(count), "EA", history_text_format
                )
                worksheet.merge_range(
                    "G" + str(count) + ":" + "H" + str(count),
                    j["amount"],
                    history_number_format,
                )
                worksheet.merge_range(
                    "I" + str(count) + ":" + "J" + str(count),
                    j["price"],
                    history_number_right_format,
                )
                worksheet.merge_range(
                    "K" + str(count) + ":" + "L" + str(count),
                    j["supply"] * j["amount"],
                    history_number_right_format,
                )
                worksheet.merge_range(
                    "M" + str(count) + ":" + "N" + str(count),
                    j["surtax"] * j["amount"],
                    history_number_right_format,
                )
                count += 1

            for j in range(0, 3):
                worksheet.set_row(count - 1, 15.75)
                worksheet.merge_range(
                    "B" + str(count) + ":" + "D" + str(count), "", history_text_format
                )
                worksheet.merge_range(
                    "E" + str(count) + ":" + "F" + str(count), "", history_text_format
                )
                worksheet.merge_range(
                    "G" + str(count) + ":" + "H" + str(count), "", history_number_format
                )
                worksheet.merge_range(
                    "I" + str(count) + ":" + "J" + str(count),
                    "",
                    history_number_right_format,
                )
                worksheet.merge_range(
                    "K" + str(count) + ":" + "L" + str(count),
                    "",
                    history_number_right_format,
                )
                worksheet.merge_range(
                    "M" + str(count) + ":" + "N" + str(count),
                    "",
                    history_number_right_format,
                )
                count += 1

            # 내역 리스트 후 설정
            after_format = workbook.add_format({"border": 2, "border_color": i,})
            after_blue_format = workbook.add_format(
                {
                    "border": 2,
                    "border_color": i,
                    "align": "center",
                    "valign": "vcenter",
                    "bold": 1,
                    "color": i,
                    "font_name": "굴림체",
                    "font_size": 10,
                }
            )
            after_black_format = workbook.add_format(
                {
                    "border": 2,
                    "border_color": i,
                    "align": "center",
                    "valign": "vcenter",
                    "color": "black",
                    "font_name": "굴림체",
                    "font_size": 10,
                    "num_format": "#,##0_);(#,##0)",
                }
            )
            after_black_right_format = workbook.add_format(
                {
                    "border": 2,
                    "border_color": i,
                    "align": "right",
                    "valign": "vcenter",
                    "color": "black",
                    "font_name": "굴림체",
                    "font_size": 10,
                    "num_format": "#,##0_);(#,##0)",
                }
            )
            worksheet.merge_range(
                "B" + str(count) + ":" + "F" + str(count), "계", after_blue_format
            )
            worksheet.merge_range(
                "G" + str(count) + ":" + "H" + str(count),
                "=SUM(G10:H" + str(len(data["his"]) + 9) + ")",
                after_black_format,
            )
            worksheet.merge_range(
                "I" + str(count) + ":" + "J" + str(count), "", after_format
            )
            worksheet.merge_range(
                "K" + str(count) + ":" + "L" + str(count),
                "=SUM(K10:L" + str(len(data["his"]) + 9) + ")",
                after_black_right_format,
            )
            worksheet.merge_range(
                "M" + str(count) + ":" + "N" + str(count),
                "=SUM(M10:N" + str(len(data["his"]) + 9) + ")",
                after_black_right_format,
            )
            count += 1

            worksheet.merge_range(
                "B" + str(count) + ":" + "F" + str(count), "합     계", after_blue_format
            )
            worksheet.merge_range(
                "G" + str(count) + ":" + "H" + str(count),
                "=SUM(G10:H" + str(len(data["his"]) + 9) + ")",
                after_black_format,
            )
            worksheet.merge_range(
                "I" + str(count) + ":" + "J" + str(count), "", after_format
            )
            worksheet.merge_range(
                "K" + str(count) + ":" + "N" + str(count),
                "=SUM(K10:L"
                + str(len(data["his"]) + 9)
                + ")+SUM(M10:N"
                + str(len(data["his"]) + 9)
                + ")",
                after_black_right_format,
            )
            count += 1

            last_B_format = workbook.add_format(
                {"left": 2, "bottom": 2, "border_color": i,}
            )
            last_BJ_after_format = workbook.add_format(
                {"bottom": 2, "border_color": i,}
            )
            last_KL_format = workbook.add_format(
                {
                    "right": 2,
                    "bottom": 2,
                    "border_color": i,
                    "align": "center",
                    "valign": "vcenter",
                    "color": i,
                    "font_name": "굴림체",
                    "font_size": 10,
                }
            )
            last_MN_format = workbook.add_format(
                {
                    "right": 2,
                    "bottom": 2,
                    "border_color": i,
                    "align": "right",
                    "valign": "vcenter",
                    "color": i,
                    "font_name": "굴림체",
                    "font_size": 10,
                }
            )
            worksheet.write("B" + str(count), "", last_B_format)

            list = ["C", "D", "E", "F", "G", "H", "I", "J"]
            for j in list:
                worksheet.write(j + str(count), "", last_BJ_after_format)

            worksheet.merge_range(
                "K" + str(count) + ":" + "L" + str(count), "인 수 자", last_KL_format
            )
            worksheet.merge_range(
                "M" + str(count) + ":" + "N" + str(count), "(인)", last_MN_format
            )

            count += 1

            if i == "red":
                worksheet.set_row(count - 1, 10.5)
                last_format = workbook.add_format(
                    {"bottom": 3, "border_color": "black",}
                )

                list = ["B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N"]
                for j in list:
                    worksheet.write(j + str(count), "", last_format)

        # A4 설정
        worksheet.set_paper(9)
        # 인쇄 된 페이지를 가로 중앙으로
        worksheet.center_horizontally()
        # 인쇄 된 페이지를 세로 중앙으로
        worksheet.center_vertically()
        # 화면 및 인쇄 된 격자 선을 숨김.
        worksheet.hide_gridlines(2)
        # 인쇄 영역 설정
        worksheet.print_area(f"A1:O{str(count)}")
        # 인쇄 영역을 가로 및 세로 모두 특정 페이지 수에 맞춤.
        worksheet.fit_to_pages(1, 1)

        workbook.close()

        # Rewind the buffer.
        output.seek(0)

        # Set up the Http response.
        filename = f"{data['tra']['register_date'][0:4]}{data['tra']['register_date'][5:7]}{data['tra']['register_date'][8:10]} {data['tra']['customer_name']} 거래명세서.xlsx"
        response = HttpResponse(
            output,
            content_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        )

        # content-disposition이 프론트엔드에서도 볼수 있도록 설정
        # response["Access-Control-Expose-Headers"] = "filename"
        # response["Access-Control-Expose-Headers"] = "Content-Disposition"

        # header = req.headers["User-Agent"]
        # if "Edge" in header:
        #     filename = filename.encode("UTF-8").replaceAll("\\+", "%20")
        #     response["Content-Disposition"] = f"attachment; filename=\{filename}\.xlsx"
        # elif "MISE" in header or "Trident" in header:
        #     filename = filename.encode("UTF-8").replaceAll("\\+", "%20")
        #     response["Content-Disposition"] = f"attachment; filename={filename}.xlsx"
        # elif "Chrome" in header:
        #     # filename = new String(title.getBytes("UTF-8"), "ISO-8859-1")
        #     filename = filename.encode("ISO-8859-1").replaceAll("\\+", "%20")
        #     response["Content-Disposition"] = f"attachment; filename=\{filename}\.xlsx"
        # elif "Opera" in header:
        #     # filename = new String(title.getBytes("UTF-8"), "ISO-8859-1")
        #     filename = filename.encode("ISO-8859-1").replaceAll("\\+", "%20")
        #     response["Content-Disposition"] = f"attachment; filename=\{filename}\.xlsx"
        # elif "Firefox" in header:
        #     # filename = new String(title.getBytes("UTF-8"), "ISO-8859-1")
        #     filename = filename.encode("ISO-8859-1").replaceAll("\\+", "%20")
        #     response["Content-Disposition"] = f"attachment; filename={filename}.xlsx"

        # response["Content-Disposition"] = f"attachment; filename={filename}"
        # response["filename"] = filename
        # print(response["filename"])

        return response

