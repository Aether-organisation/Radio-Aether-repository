{
    'name': 'Aether Featured Radio Stations',
    'version': '1.0',
    'summary': 'Manage featured radio station requests and approvals',
    'description': """
        A B2B module to request, approve and manage featured radio stations.
        Connects with Radio Aether Backend.
    """,
    'category': 'Sales',
    'author': 'Aether',
    'depends': ['base'],
    'data': [
        'security/ir.model.access.csv',
        'views/featured_request_views.xml'
    ],
    'installable': True,
    'application': True,
}
