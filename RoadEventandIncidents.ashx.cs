using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Web;
using System.Xml.Serialization;

namespace TestAPI
{
    /// <summary>
    /// Summary description for RoadEventandIncidents
    /// </summary>
    public class RoadEventandIncidents : IHttpHandler
    {
        #region IHttpHandler Members
        public void ProcessRequest(HttpContext context)
        {
            XmlSerializer serializer = new XmlSerializer(typeof(Note));
            MemoryStream stream = new MemoryStream();

            StreamWriter writer = new StreamWriter(stream, Encoding.Unicode);
            serializer.Serialize(writer, new Note() { Name = "Kundan Sinha", Place = "Bangalore", State = "Karnataka" });
            int count = (int)stream.Length;

            byte[] arr = new byte[count];
            stream.Seek(0, SeekOrigin.Begin);


            stream.Read(arr, 0, count);


            UnicodeEncoding utf = new UnicodeEncoding();

            stream.Close();
            writer.Close();

            context.Response.ContentType = "text/xml;charset=utf-8";

            context.Response.Write(utf.GetString(arr).Trim());

            context.Response.Flush();
        }

        public bool IsReusable
        {
            get
            {
                return true;
            }
        }
        #endregion
    }
    public class Note
    {
        public string Name { get; set; }
        public string Place { get; set; }
        public string State { get; set; }
    }
}