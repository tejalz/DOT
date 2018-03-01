using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.UI;
using System.Web.UI.WebControls;

public partial class SortingArray : System.Web.UI.Page
{
    protected void Page_Load(object sender, EventArgs e)
    {
        int[] i = new int[5] { 2,4,6,10,8};
        Array.Sort(i);
        foreach(int j in i) { Response.Write(j); }
    }
}