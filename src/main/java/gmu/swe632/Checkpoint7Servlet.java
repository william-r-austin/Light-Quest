package gmu.swe632;

import java.io.IOException;

import javax.servlet.RequestDispatcher;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

@WebServlet(
    name = "Checkpoint7Servlet",
    urlPatterns = {"/checkpoint-7", "/visual-design-critique-and-iteration"}
)
public class Checkpoint7Servlet extends HttpServlet {

	private static final long serialVersionUID = -7159545361601340339L;

	@Override
	public void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException, ServletException {
		String requestURI = request.getRequestURI();
		System.out.println("The request URI is: " + requestURI);
		
		RequestDispatcher view = request.getRequestDispatcher("/checkpoint-7.html");
		view.forward(request, response);
	}
	
	@Override
	public void doPost(HttpServletRequest request, HttpServletResponse response) throws IOException, ServletException {
		doGet(request, response);
	}
}
