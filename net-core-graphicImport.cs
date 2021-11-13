using Newtonsoft.Json.Linq;
using OfficeOpenXml;
using RestSharp;
using SixLabors.ImageSharp;
using SixLabors.ImageSharp.PixelFormats;
using SixLabors.ImageSharp.Processing;
using System;
using System.Data;
using System.IO;
using System.IO.Compression;
using System.Linq;
using System.Net;

namespace GameGraphicImporter
{
    class Program
    {
        static void Main(string[] args)
        {
            File.Delete(@"c:\data\log.txt");
            Log("Starting Import", "info");
            var wc = new System.Net.WebClient();
            MD(@"c:\data\imported");
            var dtContent = GetDataTableFromExcel(@"c:\data\import_data.xlsx");
            int count = 1;
            foreach (DataRow dr in dtContent.Rows)
            {
                var promo = dr["Promo"].ToString();
                var GameURL = dr["URL"].ToString();
                var Title = dr["Title"].ToString();
                var Desc = dr["Short Desc"].ToString();
                var clean = cleanse(Title);
                MD(@"c:\data\imported\" + clean);
                Log("importing " + count + ":" + clean, "info");
                DownloadImage(promo, @"c:\data\imported\" + clean + @"\thumb.png");
                UploadImage(clean, @"c:\data\imported\" + clean);
                createGameInAPI(count, Title, Desc, GameURL, "Test Games", "Credit Based", "1", "1", @"http://macsgameboard.com/img/thumbs/" + clean + ".png") ;
            recycle:
                count++;
            }
            Log("Finished Import", "info");
        }
        public static void DownloadImage(string source, string dest)
        {
            using(WebClient client = new WebClient())
{
                client.DownloadFile(new Uri(source), dest);
                 }
        }
        public static void UploadImage(string fileName, string path)
        {
            using (var client = new WebClient())
            {
                client.Credentials = new NetworkCredential("xxxx", "xxxx");
                client.UploadFile("ftp:xxxxxx/img/thumbs/" + fileName + ".png", WebRequestMethods.Ftp.UploadFile, path + @"\" + "thumb.png");
            }
        }
        static string cleanse(string dirty)
        {
            return dirty.Replace("-", "").Replace(" ", "").Replace("(", "").Replace(")", "").Replace("&", "").Replace("?", "").Replace("!", "").Replace("'", "").Replace("`", "").Replace(".io", "").Replace(":", "");
        }
        static void MD(string name)
        {
            if (Directory.Exists(name))
            {
                Directory.Delete(name, true);
                return;
            }
            Directory.CreateDirectory(name);
        }

        static void Log(string message, string type)
        {
            if (type != "error")
            {
                Console.WriteLine(DateTime.Now + "[" + message + "]");
            }
            else
            {
                using (var writer = File.AppendText(@"c:\data\log.txt"))
                {
                    writer.WriteLine(message);
                    Console.WriteLine(DateTime.Now + "[" + message + "]");
                }
            }
        }
        private static DataTable GetDataTableFromExcel(string path, bool hasHeader = true)
        {
            ExcelPackage.LicenseContext = LicenseContext.Commercial;

            using (var pck = new OfficeOpenXml.ExcelPackage())
            {
                using (var stream = File.OpenRead(path))
                {
                    pck.Load(stream);
                }
                var ws = pck.Workbook.Worksheets.First();
                DataTable tbl = new DataTable();

                foreach (var firstRowCell in ws.Cells[1, 1, 1, ws.Dimension.End.Column])
                {
                    tbl.Columns.Add(hasHeader ? firstRowCell.Text : string.Format("Column {0}", firstRowCell.Start.Column));
                }
                var startRow = hasHeader ? 2 : 1;
                var endRow = 101;
                for (int rowNum = startRow; rowNum <= endRow; rowNum++)
                {
                    var wsRow = ws.Cells[rowNum, 1, rowNum, ws.Dimension.End.Column];
                    DataRow row = tbl.Rows.Add();
                    foreach (var cell in wsRow)
                    {
                        row[cell.Start.Column - 1] = cell.Text;
                    }
                }
                return tbl;
            }
        }
        private static void createGameInAPI(int count, string gamename, string gametext, string gameurl, string gamecategory, string paytype, string creditcost, string minpercredit, string gameimage)
        {
            var client = new RestClient("http://xxxxxx:7777/api");
            var sessionKey = "xxxxxxxxxxxxxxxxxxxxx";
            //JObject boom = JObject.Parse();
            var jsonBody = "{\"action\":\"addupdategame\",\"session_key\":\"" + sessionKey + "\",\"data\":{\"GameCatalogID\":\"new\",\"GameID\":\"" + "game" + count + "\",\"GameName\":\"" + gamename + "\",\"GameText\":\"" + gametext + "\",\"GameURL\":\"" + gameurl + "\",\"GameCategoryDesc\":\"" + gamecategory + "\",\"GamePayTypeDesc\":\"" + paytype + "\",\"CreditCost\":\"" + creditcost + "\",\"MinPerCredit\":\"" + minpercredit + "\",\"GameImage\":\"" + gameimage + "\"}}";
            //JObject json = JObject.Parse(jsonBody);
            var request = new RestSharp.RestRequest("/Request", RestSharp.Method.POST) { RequestFormat = RestSharp.DataFormat.Json }
            .AddJsonBody(jsonBody);

            var response = client.Execute(request);
        }
    }
}
